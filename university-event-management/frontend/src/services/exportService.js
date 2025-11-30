import { registrationAPI, boothPollAPI } from './api';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const exportRegistrationsToXLSX = async (event) => {
  if (!event || !event._id) {
    toast.error("Event is not valid.");
    throw new Error("Event is not valid.");
  }

  try {
    // Check if this is a booth poll (has vendors array and pollEndDate)
    const isBoothPoll = event.eventType === 'Booth Poll' || 
                        event.type === 'Booth Poll' ||
                        (event.vendors && Array.isArray(event.vendors) && event.pollEndDate);
    
    // Check if this is a booth application (has attendees array and boothSize but no vendors/pollEndDate)
    const isBoothApplication = event.type === 'booth' || 
                                (event.attendees && Array.isArray(event.attendees) && event.boothSize && !event.vendors);
    
    let dataToExport = [];
    let count = 0;
    let sheetName = 'Registrations';
    
    if (isBoothPoll) {
      // Fetch booth poll data with populated votes
      const response = await boothPollAPI.getPoll(event._id);
      const pollData = response.data?.data || response.data;
      
      if (!pollData || !pollData.votes || pollData.votes.length === 0) {
        toast.info("No users have voted on this poll yet.");
        return;
      }
      
      // Map votes to export format
      dataToExport = pollData.votes.map(vote => ({
        Name: vote.user ? `${vote.user.firstName} ${vote.user.lastName}` : 'N/A',
        Email: vote.user ? vote.user.email : 'N/A',
        'Voted For': pollData.vendors[vote.vendorIndex]?.companyName || 'N/A',
        'Vote Date': new Date(vote.votedAt).toLocaleDateString(),
      }));
      
      count = pollData.votes.length;
      sheetName = 'Votes';
    } else if (isBoothApplication) {
      // Booth applications have attendees, not registrations
      const attendees = event.attendees || [];
      
      if (attendees.length === 0) {
        toast.info("No attendees have been added to this booth yet.");
        return;
      }
      
      // Map attendees to export format
      dataToExport = attendees.map(attendee => ({
        Name: attendee.name || 'N/A',
        Email: attendee.email || 'N/A',
        'ID Proof': attendee.idProofImageUrl ? 'Uploaded' : 'Not Uploaded',
      }));
      
      count = attendees.length;
      sheetName = 'Attendees';
    } else {
      // Regular event - fetch registrations
      const response = await registrationAPI.getEventRegistrations(event._id);
      const registrations = response.data?.data || [];

      if (registrations.length === 0) {
        toast.info("No users have registered for this event yet.");
        return;
      }

      dataToExport = registrations.map(reg => ({
        Name: reg.user ? `${reg.user.firstName} ${reg.user.lastName}` : `${reg.firstName} ${reg.lastName}`,
        Email: reg.user ? reg.user.email : reg.email,
        'University ID': reg.user ? reg.user.universityId : reg.universityId,
        Role: reg.user ? reg.user.role : 'N/A',
        'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
      }));
      
      count = registrations.length;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const colWidths = Object.keys(dataToExport[0]).map(key => ({ wch: Math.max(key.length, 20) }));
    worksheet['!cols'] = colWidths;

    const eventName = event.title || event.name;
    const fileName = `${sheetName}_${eventName.replace(/ /g, '_')}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    
    const exportType = isBoothPoll ? 'vote(s)' : isBoothApplication ? 'attendee(s)' : 'registration(s)';
    toast.success(`Successfully exported ${count} ${exportType}.`);

  } catch (error) {
    console.error("Failed to export registrations:", error);
    toast.error(error.message || "Failed to export registrations.");
  }
};
