
# 📧 Temp Email

A free, temporary email service built with Node.js and Express that uses the Mail.tm API to generate disposable email addresses. Perfect for protecting your primary email from spam and unwanted subscriptions.

## ✨ Features

- **Instant Email Generation**: Create temporary email addresses in seconds
- **Real-time Inbox**: Auto-refresh inbox every 5 seconds to check for new messages
- **Email Reading**: View full email content with HTML support
- **Auto-cleanup**: Emails automatically deleted after 24 hours
- **Session Persistence**: Resume your session within 1 hour
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Vietnamese Interface**: User-friendly Vietnamese language interface

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository or open in Replit

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://0.0.0.0:5000
```

## 📁 Project Structure

```
temp-email-app/
├── server.js       # Express server with API endpoints
├── index.html      # Main HTML interface
├── style.css       # Styling and responsive design
├── script.js       # Frontend JavaScript logic
├── package.json    # Project dependencies
└── README.md       # This file
```

## 🔧 API Endpoints

### Create Email Account
```
GET /email-create
```
Generates a new temporary email address with authentication token.

**Response:**
```json
{
  "Gmail": "temp12345678@example.com",
  "password": "randompassword123",
  "token": "jwt_token_here"
}
```

### Get Inbox Messages
```
GET /email-inbox?gmail=email@example.com&token=your_token
```
Retrieves all messages for the specified email address.

**Response:**
```json
{
  "gmail": "temp12345678@example.com",
  "total": 2,
  "messages": [...]
}
```

## 🎨 Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Mail.tm REST API
- **Styling**: Custom CSS with gradient backgrounds and animations

## 🌐 Deployment

This application is configured for deployment on Replit with automatic scaling:

```bash
npm run start
```

The server runs on port 5000 by default and is accessible at port 80/443 in production.

## 💡 Usage

1. **Get Email**: Upon loading, a temporary email is automatically generated
2. **Copy Email**: Click the "Copy" button to copy the email address
3. **Receive Messages**: New emails appear automatically in the inbox
4. **Read Email**: Click on any email to view its full content
5. **Refresh**: Create a new email or manually refresh the inbox as needed

## 🔒 Privacy & Security

- All email addresses are temporary and automatically deleted after 24 hours
- No personal information is stored permanently
- Session data is only saved in browser localStorage for 1 hour
- All API communications use HTTPS

## 📝 License

ISC

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⚡ Powered By

[Mail.tm API](https://mail.tm) - Free temporary email service

---

**Note**: This is a temporary email service. Do not use it for important communications or account registrations that require long-term access.
