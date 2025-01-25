import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [trainers] = await pool.query('SELECT * FROM trainer');
        return NextResponse.json({ trainers }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'ดึงข้อมูลเทรนเนอร์ไม่สําเร็จ', details: error.message },
            { status: 500 }
        );
    }
}

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

        console.log(
            trainer_username, trainer_password,
            trainer_firstname, trainer_lastname, trainer_nickname,
            trainer_email, trainer_phone, trainer_dob,
            trainer_gender, trainer_exp, trainer_startdate,
            trainer_enddate
        );

        // Add input validation here
        if (!trainer_username || !trainer_password) {
            return NextResponse.json(
                { error: 'ต้องระบุชื่อผู้ใช้งานและรหัสผ่าน' },
                { status: 400 }
            );
        }

        const [res] = await pool.query(
            'INSERT INTO trainer (trainer_username, trainer_password, trainer_firstname, trainer_lastname, trainer_nickname, trainer_email, trainer_phone, trainer_dob, trainer_gender, trainer_exp, trainer_startdate, trainer_enddate, trainer_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [
                trainer_username, trainer_password,
                trainer_firstname, trainer_lastname, trainer_nickname,
                trainer_email, trainer_phone, trainer_dob,
                trainer_gender, trainer_exp, trainer_startdate,
                trainer_enddate, 0
            ]
        );

        return NextResponse.json({ res }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'สร้างเทรนเนอร์ไม่สําเร็จ', details: error.message },
            { status: 500 }
        );
    }
}





// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const { 
//             member_id, member_name, member_pass,
//             member_firstname, member_lastname, member_nickname,
//             member_email, member_phone, member_dob,
//             member_gender, member_exp, member_startdate,
//             member_enddate, member_status 
//         } = body;

//         // Add input validation here
//         if (!member_id || !member_name || !member_pass) {
//             return NextResponse.json(
//                 { error: 'Missing required fields' },
//                 { status: 400 }
//             );
//         }

//         const [res] = await pool.query(
//             'INSERT INTO member VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
//             [member_id, member_name, member_pass,
//              member_firstname, member_lastname, member_nickname,
//              member_email, member_phone, member_dob,
//              member_gender, member_exp, member_startdate,
//              member_enddate, member_status]
//         );

//         return NextResponse.json({ res }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json(
//             { error: 'Failed to create member', details: error.message },
//             { status: 500 }
//         );
//     }
// }
