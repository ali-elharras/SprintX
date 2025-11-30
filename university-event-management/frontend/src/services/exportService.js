import { registrationAPI } from './api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const exportRegistrationsToXLSX = async (event) => {
  if (!event || !event._id) {
    toast.error("Event is not valid.");
    throw new Error("Event is not valid.");
  }

  try {
    const response = await registrationAPI.getEventRegistrations(event._id);
    const registrations = response.data?.data || [];

    if (registrations.length === 0) {
      toast.info("No users have registered for this event yet.");
      return;
    }

    const dataToExport = registrations.map(reg => ({
      Name: reg.user ? `${reg.user.firstName} ${reg.user.lastName}` : `${reg.firstName} ${reg.lastName}`,
      Email: reg.user ? reg.user.email : reg.email,
      'University ID': reg.user ? reg.user.universityId : reg.universityId,
      Role: reg.user ? reg.user.role : 'N/A',
      'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const colWidths = Object.keys(dataToExport[0]).map(key => ({ wch: Math.max(key.length, 20) }));
    worksheet['!cols'] = colWidths;

    const eventName = event.title || event.name;
    const fileName = `Registrations_${eventName.replace(/ /g, '_')}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success(`Successfully exported ${registrations.length} registration(s).`);

  } catch (error) {
    console.error("Failed to export registrations:", error);
    toast.error(error.message || "Failed to export registrations.");
  }
};
