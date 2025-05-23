const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',  // Replace with your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const notifyAdmin = async (type, data) => {
    const admins = await User.find({ role: 'admin' });
    const adminEmails = admins.map(admin => admin.email);

    let subject, text;
    switch(type) {
        case 'main_entry':
            subject = 'Main Container Fuel Entry';
            text = `New fuel entry in main container:\nAmount: ${data.amount}L\nWorker: ${data.workerName}`;
            break;
        case 'to_generator':
            subject = 'Generator Fuel Transfer';
            text = `Fuel transferred to generator ${data.generatorName}:\nAmount: ${data.amount}L\nWorker: ${data.workerName}`;
            break;
        case 'run_log':
            subject = 'Generator Run Log';
            text = `Generator ${data.generatorName} run log:\nDuration: ${data.duration} minutes\nFuel Consumed: ${data.fuelConsumed}L\nWorker: ${data.workerName}`;
            break;
    }

    for (const email of adminEmails) {
        await sendEmail(email, subject, text);
    }
};

module.exports = { sendEmail, notifyAdmin }; 