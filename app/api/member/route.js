import pool from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {

        const [members] = await pool.query('SELECT * FROM member');
        return NextResponse.json({ members }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch members', details: error.message },
            { status: 500 }
        );
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            member_id, member_name, member_pass,
            member_firstname, member_lastname, member_nickname,
            member_email, member_phone, member_dob,
            member_gender, member_exp, member_startdate,
            member_enddate, member_status 
        } = body;

        // Add input validation here
        if (!member_id || !member_name || !member_pass) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const [res] = await pool.query(
            'INSERT INTO member VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [member_id, member_name, member_pass,
             member_firstname, member_lastname, member_nickname,
             member_email, member_phone, member_dob,
             member_gender, member_exp, member_startdate,
             member_enddate, member_status]
        );

        return NextResponse.json({ res }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create member', details: error.message },
            { status: 500 }
        );
    }
}

