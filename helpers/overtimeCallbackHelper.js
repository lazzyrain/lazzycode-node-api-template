const formatDuration = (ms) => {
    if (ms <= 0) return "00:00";

    const totalMinutes = Math.floor(ms / 60000);
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');

    return `${hh}:${mm}`;
}

const formatDateTime = (date) => {
    const pad = n => String(n).padStart(2, '0');

    return (
        date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds())
    );
}

export const ProcessAttendanceOvertimeCallback = async (overtimeCallbackList, fingerList) => {
    const fingerByEmp = {};
    for (const finger of fingerList) {
        if (!fingerByEmp[finger.emp_id]) fingerByEmp[finger.emp_id] = [];

        fingerByEmp[finger.emp_id].push({
            time: new Date(finger.CHECKTIME),
            type: finger.CHECKTYPE
        });
    }

    for (const empId in fingerByEmp) {
        fingerByEmp[empId].sort((a, b) => a.time - b.time);
    }

    const result = [];
    for (const record of overtimeCallbackList) {
        const empId = record.employee_id;
        const fingers = fingerByEmp[empId] || [];
        const overtimeCallbackFrom = new Date(`${record.overtime_callback_attendance_in}`);
        const overtimeCallbackTo = new Date(`${record.overtime_callback_attendance_out}`);

        const overtimeCallbackBefore = 1 * 3600 * 1000;
        const overtimeCallbackBeforeAfter = 8 * 3600 * 1000;
        const windowOvertimeCallbackInStart = new Date(overtimeCallbackFrom.getTime() - overtimeCallbackBefore);
        const windowOvertimeCallbackInEnd = overtimeCallbackTo;
        const windowOvertimeCallbackOutStart = new Date(overtimeCallbackFrom);
        let windowOvertimeCallbackOutEnd = new Date(overtimeCallbackTo.getTime() + overtimeCallbackBeforeAfter);

        if (record.next_overtime_callback_attendance_in) {
            const next_overtime_callback_attendance_in = new Date(`${record.next_overtime_callback_attendance_in}`);

            windowOvertimeCallbackOutEnd = next_overtime_callback_attendance_in
        }
        
        let actualIn = null;
        let actualOut = null;

        for (const finger of fingers) {
            const fingerTime = finger.time;

            if (
                finger.type === "I" &&
                !actualIn &&
                fingerTime >= windowOvertimeCallbackInStart &&
                fingerTime <= windowOvertimeCallbackInEnd
            ) {
                actualIn = fingerTime;
            }

            if (
                finger.type === "O" &&
                !actualOut &&
                fingerTime >= windowOvertimeCallbackOutStart &&
                fingerTime <= windowOvertimeCallbackOutEnd
            ) {
                actualOut = fingerTime;
            }
        }

        let status = "";
        let late = "00:00";
        let early = "00:00";

        if (!actualIn || !actualOut) {
            status = "INCOMPLETE"; // TIDAK LENGKAP
        }

        if ((overtimeCallbackFrom && overtimeCallbackTo) && (!actualIn && !actualOut)) {
            status = "ABSENT"; // TIDAK HADIR
        }

        if (actualIn && actualOut) {
            status = "PRESENT"; // HADIR

            if (actualIn > overtimeCallbackFrom) {
                status = "LATE ARRIVAL"; // TELAT
                late = formatDuration(actualIn - overtimeCallbackFrom);
            }

            if (actualOut < overtimeCallbackTo) {
                early = formatDuration(overtimeCallbackTo - actualOut);
            }
        }

        result.push({
            ...record,
            overtime_callback_actual_in: actualIn ? formatDateTime(actualIn) : '',
            overtime_callback_actual_out: actualOut ? formatDateTime(actualOut) : '',
            overtime_callback_status: status,
            overtime_callback_late: late,
            overtime_callback_early: early
        });
    }

    return result;
}

// const overtimeCallbackList = $('Get List Overtime Callback').first().json.data;
// const fingerList = $('Get List Raw Attendance').first().json.data;
// const result = ProcessAttendanceOvertimeCallback(overtimeCallbackList, fingerList);

// return result;