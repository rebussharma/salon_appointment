import emailjs from '@emailjs/browser';
import { ClientInfo, emailProps } from '../../utils/types';

const TEMPLATE_ID_SELF = "template_wthysze";
const SERVICE_ID = "service_hr7wfln";
const TEMPLATE_ID = "template_y1syqfc";
const PUBLIC_KEY = "48zrrLrcyVtY6tuNs";

export const SendEmail = ({ clientDetails, appointmentDetails }: emailProps) => {
    const apptDateTime = new Date(appointmentDetails.appointmentDateTime.toString());
    const { serviceType, artist, status, confirmationNumer } = appointmentDetails;

    const clientEmailSubject = `Appointment ${status.toLocaleUpperCase()}`;
    const clientEmailBody = `Your appointment has been ${status.toLocaleUpperCase()}.\nDetails:\n` +
        `Confirmation Code: ${confirmationNumer}\n` +
        `Date and Time: ${apptDateTime.toDateString()} at ${apptDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
        `Service: ${serviceType}\nArtist: ${artist}\n`;

    const clientEmailSeeYou = status === "confirmed"
        ? "We're excited to see you :)"
        : "Hope we will see you some other time :)";

    const selfSubject = `Appointment ${status.toLocaleUpperCase()} Notice`;
    const selfBody = `New Appointment Status. Details:\n` +
        `Confirmation Code: ${confirmationNumer}\nStatus: ${status}\n` +
        `Date and Time: ${apptDateTime.toDateString()} at ${apptDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
        `Service: ${serviceType}\nArtist: ${artist}\n`;

    // Send email to self and client
    SendEmailToSelfThenClient(clientDetails, selfSubject, selfBody, clientEmailSubject, clientEmailBody, clientEmailSeeYou);
};

const SendEmailToSelfThenClient = (
    clientDetails: ClientInfo,
    selfSubject: string,
    selfBody: string,
    clientEmailSubject: string,
    clientEmailBody: string,
    clientEmailSeeYou: string
) => {
    emailjs.init(PUBLIC_KEY);
    emailjs
        .send(SERVICE_ID, TEMPLATE_ID_SELF, {
            message: clientDetails.message,
            client_name: clientDetails.name || "Name not provided",
            client_phone: clientDetails.phone,
            client_email: clientDetails.emailId,
            subject: selfSubject,
            bodyText: selfBody,
        })
        .then(() => {
            sendEmailToClient(
                clientDetails.name,
                clientDetails.emailId,
                clientDetails.message,
                clientEmailSubject,
                clientEmailBody,
                clientEmailSeeYou
            );
        })
        .catch((error) => {
            console.error('Failed Sending Email to Sammys Brow!...', error.text);
        });
};

const sendEmailToClient = (
    name: string,
    clientEmailId: string,
    message: string,
    subject: string,
    bodyText: string,
    seeYouText: string
) => {
    if (clientEmailId) {
        emailjs
            .send(SERVICE_ID, TEMPLATE_ID, {
                client_name: name || "Name not provided",
                recipient: clientEmailId,
                messageNotes: message,
                subject: subject,
                bodyText: bodyText,
                seeYouText: seeYouText,
            })
            .catch((error) => {
                console.error(`Failed to send email to ${clientEmailId}`, error.text);
            });
    } else {
        console.error("Customer Email is empty");
    }
};