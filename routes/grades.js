import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.post("/add", async (req, res, next) => {
    try {
        let newGrade = req.body;
        if (!newGrade.student || !newGrade.subject || !newGrade.type || newGrade.value < 0) {
            throw new Error("Student, subject, type and value are needed!");
        }
        const gradeList = JSON.parse(await readFile(global.gradesJSON));

        newGrade = {
            id: gradeList.nextId++,
            student: newGrade.student,
            subject: newGrade.subject,
            type: newGrade.type,
            value: newGrade.value,
            timestamp: new Date()
        }

        gradeList.grades.push(newGrade);

        await writeFile(global.gradesJSON, JSON.stringify(gradeList, null, '\t'));

        res.send(JSON.stringify(newGrade, null, '\t'));
    } catch (error) {
        next(error);
    }
});

router.put("/update", async (req, res, next) => {
    try {
        let newGrade = req.body;
        if (!newGrade.student || !newGrade.subject || !newGrade.type || newGrade.value < 0 || newGrade.id == null) {
            throw new Error("Student, subject, type, value and id are needed!");
        }
        const gradeList = JSON.parse(await readFile(global.gradesJSON));

        const index = await gradeList.grades.findIndex(grade => grade.id === parseInt(newGrade.id));
        if (index === -1) {
            throw new Error("Could not find student");
        }

        gradeList.grades[index].student = newGrade.student;
        gradeList.grades[index].subject = newGrade.subject;
        gradeList.grades[index].type = newGrade.type;
        gradeList.grades[index].value = newGrade.value;
        gradeList.grades[index].timestamp = new Date();

        await writeFile(global.gradesJSON, JSON.stringify(gradeList, null, '\t'));

        res.send(JSON.stringify(newGrade, null, '\t'));
    } catch (error) {
        next(error);
    }
});

router.delete("/delete/:id", async (req, res, next) => {
    try {
        const gradeList = JSON.parse(await readFile(global.gradesJSON));
        gradeList.grades = gradeList.grades.filter(grade => grade.id !== parseInt(req.params.id));

        await writeFile(global.gradesJSON, JSON.stringify(gradeList, null, '\t'));

        res.send("Success");
    } catch (error) {
        next(error);
    }
});

router.get("/get/:id", async (req, res, next) => {
    try {
        const gradeList = JSON.parse(await readFile(global.gradesJSON));
        const grade = gradeList.grades.filter(grade => grade.id === parseInt(req.params.id));

        res.send(grade);
    } catch (error) {
        next(error);
    }
});

router.get("/get-grade", async (req, res, next) => {
    try {
        const current = req.body;
        const gradeList = JSON.parse(await readFile(global.gradesJSON));
        let filteredGrades = gradeList.grades.filter(grade => grade.student === current.student);
        filteredGrades = filteredGrades.filter(grade => grade.subject === current.subject);

        const total = filteredGrades.reduce((acumulator, current) => {
            return acumulator + current.value;
        }, 0);

        res.send(`Grade from ${current.student} on "${current.subject}": ${total}`);
    } catch (error) {
        next(error);
    }
});

router.get("/get-average-subject/:subject/:type", async (req, res, next) => {
    try {
        let current = req.params;
        const gradeList = JSON.parse(await readFile(global.gradesJSON));
        let filteredGrades = gradeList.grades.filter(grade => grade.subject === current.subject);
        filteredGrades = filteredGrades.filter(grade => grade.type === current.type);

        const average = filteredGrades.reduce((acumulator, current) => {
            return acumulator + current.value;
        }, 0) / filteredGrades.length;

        res.send(`Average grades from "${current.subject}" on "${current.type}" : ${average}`);
    } catch (error) {
        next(error);
    }
});

router.get("/get-best-grades/:subject/:type", async (req, res, next) => {
    try {
        let current = req.params;
        const gradeList = JSON.parse(await readFile(global.gradesJSON));
        let filteredGrades = gradeList.grades.filter(grade => grade.subject === current.subject);
        filteredGrades = filteredGrades.filter(grade => grade.type === current.type).sort((a, b) => {
            return b.value - a.value;
        });

        const best = [filteredGrades[0], filteredGrades[1], filteredGrades[2]];

        res.send(JSON.stringify(best));
    } catch (error) {
        next(error);
    }
});

router.use((error, req, res, next) => {
    console.log(error);
    res.status(400).send({ error: error.message });
});

export default router;