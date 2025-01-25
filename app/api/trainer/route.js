import pool from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {

        const [trainer] = await pool.query('SELECT * FROM trainer');
        return NextResponse.json({ trainer }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch trainer', details: error.message },
            { status: 500 }
        );
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            trainer_id, trainer_username, trainer_password,
            trainer_firstname, trainer_lastname, trainer_nickname,
            trainer_email, trainer_phone, trainer_dob,
            trainer_gender, trainer_exp, trainer_startdate,
            trainer_enddate, trainer_status 
        } = body;

        // Add input validation here
        if (!trainer_id || !trainer_username || !trainer_password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const [res] = await pool.query(
            'INSERT INTO trainer VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [trainer_id, trainer_username, trainer_password,
                trainer_firstname, trainer_lastname, trainer_nickname,
                trainer_email, trainer_phone, trainer_dob,
                trainer_gender, trainer_exp, trainer_startdate,
                trainer_enddate, trainer_status]
        );

        return NextResponse.json({ res }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create trainer', details: error.message },
            { status: 500 }
        );
    }
}

