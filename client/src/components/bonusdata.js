import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { css } from '@emotion/react';
import { RingLoader } from 'react-spinners';
import '../styles/UserShiftsDisplay.css';

function formatDateWithDay(dateString) {
  // Function to format a date string with the day of the week
  const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function UserShiftsDisplay() {
  const [loading, setLoading] = useState(true);
  const [userShiftsData, setUserShiftsData] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  // Fetch user shift data when the component mounts
  useEffect(() => {
    setLoading(true);

    fetch('http://localhost:8080/api/bonusdata')
      .then((response) => response.json())
      .then((data) => {
        setUserShiftsData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Function to toggle the expanded state of a group
  function toggleGroup(groupName) {
    setExpandedGroups((prevExpandedGroups) => ({
      ...prevExpandedGroups,
      [groupName]: !prevExpandedGroups[groupName],
    }));
  }

  // Function to export user shift data to a PDF
  function exportToPDF() {
    const doc = new jsPDF();
    let startY = 10;

    Object.keys(userShiftsData).forEach((groupName) => {
      const group = userShiftsData[groupName];
      doc.setFontSize(16);
      doc.text(`Group Name: ${groupName}`, 10, startY);

      startY += 15;

      Object.keys(group).forEach((userEmail) => {
        const user = group[userEmail];
        doc.setFontSize(14);
        doc.text(`User Email: ${userEmail}`, 10, startY);

        startY += 15;

        // Loop through user's shifts and display them in the PDF
        user.shifts.forEach((shift) => {
          const shiftInfo = `${shift.displayName} - ${formatDateWithDay(shift.startDateTime)} (${
            shift.validated ? 'Validated' : 'Not Validated'
          })`;
          const textColor = shift.validated ? 'green' : 'red';
          doc.setTextColor(textColor);

          doc.text(shiftInfo, 10, startY);
          doc.setTextColor('black'); // Reset text color

          startY += 10;
        });

        const isUserValidatedAllShifts = user.shifts.every((shift) => shift.validated);
        const validationStatus = isUserValidatedAllShifts
          ? 'User validated all shifts'
          : 'User did not validate all shifts';

        doc.setFontSize(12);
        doc.text(`Validation Status: ${validationStatus}`, 10, startY);
        startY += 15;
      });

      startY = 10;
      doc.addPage();
    });

    doc.save('bonusdata.pdf');
  }

    // Function to handle bonification calculation
// Function to handle bonification calculation
function handleBonificationCalculation() {
  const updatedUserShiftsData = { ...userShiftsData };

  // Loop through the data and apply the calculation
  for (const groupName in updatedUserShiftsData) {
    const group = updatedUserShiftsData[groupName];

    for (const userEmail in group) {
      const user = group[userEmail];

      user.shifts = user.shifts.map((shift) => {
        // Apply the calculation to the shift
        shift.bonification = shift.price * 1.5;
        return shift;
      });
    }
  }

  // Update the state with the modified data
  setUserShiftsData(updatedUserShiftsData);
}

  

  return (
    <div id="pdf-container" className="user-shifts-container">
      <div className="button-group">
        {/* Button to export data to PDF */}
        <button className="custom-button" onClick={exportToPDF}>Export Report</button>
        {/* Button to perform bonification calculation (not implemented) */}
        <button className="custom-button" onClick={handleBonificationCalculation}>Calculate Bonification</button>
      </div>
      {loading ? (
        // Display a loading spinner while data is being fetched
        <div className="loading-spinner">
          <RingLoader color="#36D7B7" loading={loading} css={css`margin: 150px auto;`} size={150} />
        </div>
      ) : (
        // Display user shift data when loading is complete
        Object.keys(userShiftsData).map((groupName) => {
          const group = userShiftsData[groupName];
          const isGroupExpanded = expandedGroups[groupName] || false;

          return (
            <div key={groupName} className="group-container">
              <h2
                className={`group-name ${isGroupExpanded ? 'expanded' : ''}`}
                onClick={() => toggleGroup(groupName)}
              >
                Group Name: {groupName}
              </h2>
              {isGroupExpanded && (
                <table className="user-container">
                  <tbody>
                    {Object.keys(group).map((userEmail) => {
                      const user = group[userEmail];
                      const isUserValidatedAllShifts = user.shifts.every((shift) => shift.validated);

                      return (
                        <tr
                          key={userEmail}
                          className={`user-row ${
                            isUserValidatedAllShifts
                              ? 'user-validated'
                              : 'user-not-validated'
                          }`}
                        >
                          <td>
                            <strong>User Email:</strong> {userEmail}
                            <br />
                            <strong>User Name:</strong> {user.userDisplayName}
                          </td>
                          <td>
                            <table className="shifts-table">
                              <tbody>
                                {user.shifts.map((shift, shiftIndex) => (
                                  <tr key={shiftIndex}>
<td>
  {shift.displayName} - {formatDateWithDay(shift.startDateTime)} (
  <span style={{ color: shift.validated ? 'green' : 'red' }}>
    {shift.validated ? 'Validated' : 'Not Validated'}
  </span>
  ) - Bonification: {shift.bonification}
</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                          {/* Display bonification calculation here (not implemented) */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default UserShiftsDisplay;
