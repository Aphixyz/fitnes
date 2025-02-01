import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET: Fetch all trainers
export async function GET() {
    try {
        const [trainers] = await pool.query('SELECT * FROM trainer');
        return NextResponse.json({ trainers }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch trainers', details: error.message },
            { status: 500 }
        );
    }
}

// POST: Create a new trainer
export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            trainer_username, trainer_password,
            trainer_firstname, trainer_lastname, trainer_nickname,
            trainer_email, trainer_phone, trainer_dob,
            trainer_gender, trainer_exp, trainer_startdate,
            trainer_enddate 
        } = body;

        // Validate required fields
        if (!trainer_username || !trainer_password || !trainer_email) {
            return NextResponse.json(
                { error: 'Username, Password, and Email are required' },
                { status: 400 }
            );
        }

        const sql = `
            INSERT INTO trainer 
            (trainer_username, trainer_password, trainer_firstname, trainer_lastname, trainer_nickname, 
            trainer_email, trainer_phone, trainer_dob, trainer_gender, trainer_exp, trainer_startdate, trainer_enddate, trainer_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            trainer_username, trainer_password,
            trainer_firstname, trainer_lastname, trainer_nickname,
            trainer_email, trainer_phone, trainer_dob,
            trainer_gender, trainer_exp, trainer_startdate,
            trainer_enddate, 0
        ];

        const [res] = await pool.query(sql, values);

        return NextResponse.json({ message: "Trainer created successfully", trainer_id: res.insertId }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create trainer', details: error.message },
            { status: 500 }
        );
    }
}