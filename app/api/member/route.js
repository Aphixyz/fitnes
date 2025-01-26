import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [members] = await pool.query('SELECT * FROM member');
        return NextResponse.json({ members }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'ดึงข้อมูลสมาชิกไม่สําเร็จ', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            member_username, member_password,
            member_firstname, member_lastname, 
            member_nickname, member_email, member_phone, 
            member_gender, member_dob
        } = body;

        console.log(
            member_username, member_password,
            member_firstname, member_lastname, 
            member_nickname, member_email, member_phone, 
            member_gender, member_dob
        );

        // Add input validation here
        if (!member_username || !member_password) {
            return NextResponse.json(
                { error: 'ต้องระบุชื่อผู้ใช้งานและรหัสผ่าน' },
                { status: 400 }
            );
        }

        const [res] = await pool.query(
            'INSERT INTO member VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                member_username, member_password, 
                member_firstname, member_lastname, 
                member_nickname, member_email, 
                member_phone, member_gender, member_dob]
        );    
        return NextResponse.json({ res }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'เพิ่มสมาชิกไม่สําเร็จ', details: error.message },
            { status: 500 }
        );
    } finally {
        return NextResponse.json(
            { message: 'เพิ่มสมาชิกสําเร็จ' },
            { status: 200 }
        );
    }
}
