// This file will handle the cancellation logic

import axios from "axios";
import { AppointmetnDetails, ClientInfo, emailProps } from "../types";
import { getAppointmentByConfirmationCode } from "./common/getAppointment";

const pushCancelData = async (data: any) => {  
  data["appointmentStatus"] = "cancelled";

  try {
    const response = await axios.put(`http://localhost:8080/api/appointments/${data["id"]}`, data);
    console.log("Appointment Cancelled", response);
    return response.data;
  } catch (error: any) {
    console.error("Error in pushing cancel data:", error);
    throw {
      message: `Error in pushing cancel data: ${error.message}`,
      source: 'pushCancelData',
      originalError: error,
    };
  }
};
  
export const HandleAppointmentCancellation = async (confirmationNumber: string): Promise<{ success: boolean; errorSource?: string }> => {
  try {
    // Get appointment details using new implementation
    const appointmentResult = await getAppointmentByConfirmationCode(confirmationNumber);
    
    if (!appointmentResult.success) {
      return {
        success: false,
        errorSource: 'getAppointmentByConfirmationCode'
      };
    }

    // Push cancellation
    try {
      const cancelledData = await pushCancelData(appointmentResult.data);
      
      // Prepare email data
      const clientDetails: ClientInfo = {
        name: cancelledData.clientName,
        emailId: cancelledData.clientEmail,
        phone: cancelledData.clientPhone,
        message: cancelledData.appointmentNotes
      };

      const appointmentDetails: AppointmetnDetails = {
        appointmentDateTime: cancelledData.appointmentDateTime,
        appointmentDuration: cancelledData.appointmentDuration,
        serviceType: cancelledData.serviceType,
        artist: cancelledData.artist,
        status: cancelledData.appointmentStatus,
        confirmationNumer: cancelledData.confirmationCode
      };

      const emailParams: emailProps = {
        clientDetails: clientDetails,
        appointmentDetails: appointmentDetails
      };

      // Send cancellation email
      // await SendEmail(emailParams);

      return { success: true };

    } catch (error: any) {
      console.error("Error in cancellation process:", error);
      return {
        success: false,
        errorSource: error.source || 'pushCancelData'
      };
    }

  } catch (error: any) {
    console.error("Error in cancellation handler:", error);
    return {
      success: false,
      errorSource: error.source || 'unknown'
    };
  }
};