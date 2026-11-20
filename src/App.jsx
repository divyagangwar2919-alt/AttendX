
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./App.css";

export default function App() {
  const [userRole, setUserRole] = useState("");
  const [loginName, setLoginName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [attendance, setAttendance] = useState(() => {
    try {
      const saved = localStorage.getItem("attendxAttendance");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "attendxAttendance",
      JSON.stringify(attendance)
    );
  }, [attendance]);

  const totalRecords = attendance.length;

  const presentClasses = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const percentage =
    totalRecords === 0
      ? 0
      : Math.round((presentClasses / totalRecords) * 100);

  const markAttendance = () => {
    if (!studentName.trim() || !studentId.trim()) {
      setMessage("Please enter your name and student ID.");
      return;
    }

    if (qrCode.trim() !== "ATTENDX2026") {
      setMessage("Invalid QR code. Please scan the correct code.");
      return;
    }

    const today = new Date().toLocaleDateString();

    const alreadyMarked = attendance.some(
      (item) =>
        item.studentId.toLowerCase() === studentId.trim().toLowerCase() &&
        item.date === today
    );

    if (alreadyMarked) {
      setMessage("Attendance already marked for today!");
      return;
    }

    const newRecord = {
      name: studentName.trim(),
      studentId: studentId.trim(),
      date: today,
      time: new Date().toLocaleTimeString(),
      status: "Present",
    };

    setAttendance((previous) => [...previous, newRecord]);
    setMessage("Attendance marked successfully!");

    setStudentName("");
    setStudentId("");
    setQrCode("");
  };

  const clearAttendance = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all attendance records?"
    );

    if (confirmClear) {
      setAttendance([]);
      setMessage("Attendance history cleared.");
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("attendx-qr");

    if (!svg) {
      setMessage("QR code not found.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 500;

      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 500, 500);
      context.drawImage(img, 0, 0, 500, 500);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");

      link.href = pngUrl;
      link.download = "AttendX-QR.png";
      link.click();

      URL.revokeObjectURL(url);
      setMessage("QR code downloaded successfully!");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("Unable to download QR code.");
    };

    img.src = url;
  };

  const downloadReport = () => {
    if (attendance.length === 0) {
      setMessage("No attendance records available.");
      return;
    }

    const headers = ["Name", "Student ID", "Date", "Time", "Status"];

    const rows = attendance.map((item) =>
      [
        item.name,
        item.studentId,
        item.date,
        item.time,
        item.status,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AttendX-Attendance-Report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setMessage("Attendance report downloaded!");
  };

  const filteredAttendance = attendance.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      item.name.toLowerCase().includes(search) ||
      item.studentId.toLowerCase().includes(search)
    );
  });

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole("");
    setLoginName("");
    setMessage("");
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="app">
        <header className="header">
          <h1>AttendX</h1>
          <p>Smart Attendance Management System</p>
        </header>

        <main className="container">
          <section className="card">
            <h2>Welcome to AttendX</h2>
            <p>Please select your login type.</p>

            <button onClick={() => setUserRole("Student")}>
              Student Login
            </button>

            <button
              onClick={() => setUserRole("Teacher")}
              style={{ marginLeft: "10px" }}
            >
              Teacher Login
            </button>

            {userRole && (
              <div style={{ marginTop: "25px" }}>
                <h3>{userRole} Login</h3>

                <input
                  type="text"
                  placeholder={`Enter ${userRole.toLowerCase()} name`}
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                />

                <button
                  onClick={() => {
                    if (loginName.trim()) {
                      setIsLoggedIn(true);
                    } else {
                      alert("Please enter your name.");
                    }
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="app">
      <header className="header">
        <h1>AttendX</h1>
        <p>Smart Attendance Management System</p>
        <p>
          Welcome, {loginName} ({userRole})
        </p>
        <button onClick={logout}>Logout</button>
      </header>

      <main className="container">
        {message && (
          <div className="card">
            <p>{message}</p>
            <button onClick={() => setMessage("")}>Close</button>
          </div>
        )}

        <section className="card">
          <h2>Student Profile</h2>
          <div className="profile">
            <div className="profile-icon">
              {loginName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{loginName}</h3>
              <p>{userRole} Account</p>
              <p>Department: Computer Science</p>
            </div>
          </div>
        </section>

        {userRole === "Teacher" && (
          <section className="card">
            <h2>Teacher Dashboard</h2>
            <p>Share this QR code with students to mark attendance.</p>

            <div style={{ textAlign: "center", padding: "20px" }}>
              <QRCodeSVG
                id="attendx-qr"
                value="ATTENDX2026"
                size={180}
                level="H"
              />
              <p>AttendX Attendance QR</p>
              <button onClick={downloadQR}>
                Download QR Code
              </button>
            </div>
          </section>
        )}

        <section className="card">
          <h2>Mark Attendance</h2>
          <p>Enter your details and the attendance QR code.</p>

          <input
            type="text"
            placeholder="Enter Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter QR Code"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
          />

          <button onClick={markAttendance}>
            Mark Attendance
          </button>
        </section>

        <section className="stats">
          <div className="card">
            <h3>Total Records</h3>
            <h2>{totalRecords}</h2>
          </div>

          <div className="card">
            <h3>Present</h3>
            <h2>{presentClasses}</h2>
          </div>

          <div className="card">
            <h3>Attendance Rate</h3>
            <h2>{percentage}%</h2>
          </div>
        </section>

        <section className="card">
          <h2>Attendance Progress</h2>

          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <p>{percentage}% attendance recorded</p>

          <h3>
            {percentage >= 75
              ? "Attendance is above 75%"
              : "Attendance is below 75%"}
          </h3>
        </section>

        <section className="card">
          <h2>Attendance History</h2>

          <input
            type="text"
            placeholder="Search by student name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button onClick={downloadReport}>
            Download Attendance Report
          </button>

          {userRole === "Teacher" && (
            <button
              onClick={clearAttendance}
              style={{ marginLeft: "10px" }}
            >
              Clear History
            </button>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((item, index) => (
                    <tr key={`${item.studentId}-${item.date}-${index}`}>
                      <td>{item.name}</td>
                      <td>{item.studentId}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer>
          <p>AttendX - Smart Attendance Management System</p>
          <p>Hackathon Project</p>
        </footer>
      </main>
    </div>
  );
}
