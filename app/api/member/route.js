import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET: Fetch all trainers
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