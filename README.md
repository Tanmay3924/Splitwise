# 💰 SplitWise – Smart Group Expense Manager

A full-stack expense management application that simplifies tracking and settling shared expenses among friends, roommates, and travel groups. The application ensures transparent expense splitting, secure authentication, and a payment verification workflow to avoid incorrect settlements.

---

## 🚀 Features

- 🔐 Secure user authentication and authorization using JWT
- 👥 Create and manage groups for trips or shared expenses
- 💸 Add, update, and delete expenses
- ⚖️ Automatically split expenses among selected group members
- 📊 View individual balances and outstanding amounts
- 📱 QR Code-based payment support for quick settlements
- ✅ Recipient-based payment verification before marking settlements as completed
- 📜 Expense history and settlement tracking
- 📱 Fully responsive user interface

---

## 🛠️ Tech Stack

### Frontend

- React
- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Token)

### Tools

- Git
- GitHub
- Postman
- npm

---

## 📂 Project Structure

```text
SplitWise/
│
├── client/          # React Frontend
├── server/          # Express Backend
├── models/          # MongoDB Schemas
├── routes/          # API Routes
├── controllers/     # Business Logic
├── middleware/      # Authentication & Authorization
├── utils/           # Helper Functions
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/splitwise.git
```

### Navigate to the Project

```bash
cd splitwise
```

### Install Backend Dependencies

```bash
cd Backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

---

## ▶️ Run the Project

### Backend

```bash
cd Backend
npm start
```

### Frontend

```bash
cd Frontend
npm run dev
```

The application will be available at:

```text
Frontend : http://localhost:5173
Backend  : http://localhost:5000
```

---

## 📌 Workflow

1. User registers and logs in securely.
2. Create a group and invite members.
3. Add shared expenses.
4. The application automatically calculates each member's share.
5. Members can initiate payments using QR Code.
6. The recipient verifies the payment.
7. Once verified, the settlement is completed and balances are updated.

---

## 🎯 Challenges Solved

- Designed an efficient expense-splitting algorithm for multiple users.
- Implemented secure JWT-based authentication and authorization.
- Built a recipient verification workflow before settlements are completed.
- Integrated QR Code-based payment functionality.
- Maintained accurate balance calculations and transaction history.

---

## 🌟 Future Enhancements

- Email notifications
- Expense analytics dashboard
- Multi-currency support
- Recurring expense management
- Group invitations via email
- Real-time updates using Socket.IO
- Export reports as PDF or Excel

---

## 👨‍💻 Author

**Tanmay Jadhav**

GitHub: https://github.com/Tanmay3924

---

## 📄 License

This project is developed for learning and educational purposes.
