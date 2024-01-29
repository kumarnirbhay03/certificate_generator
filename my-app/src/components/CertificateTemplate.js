import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import backgroundImage from './a.jpeg';

const CertificateGenerator = () => {
  const [excelData, setExcelData] = useState([]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month and pad with leading zero if needed
    const year = date.getFullYear(); // Get full year
    return `${day}-${month}-${year}`; // Return formatted date
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      var jsonData = XLSX.utils.sheet_to_json(sheet);


      jsonData = jsonData.map(item => {
        // Assuming 'date' is the key for the date field in your Excel data
        const dateValue = new Date(item.date); // Convert the date string to a Date object
        const formattedDate = `${dateValue.getDate()}/${dateValue.getMonth() + 1}/${dateValue.getFullYear()}`; // Format the date as required
        return { ...item, date: formattedDate }; // Update the 'date' field in the item
      });
      setExcelData(jsonData);
      console.log(jsonData)
    };

    if (file) {
      if (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        reader.readAsArrayBuffer(file);
      } else {
        console.error('Invalid file type. Please upload an Excel file.');
      }
    }
  };

  const generateCertificate = async () => {
    // Example JSON data
    const jsonDataArray = excelData;
    const pdfPromises = [];

    // Loop through the array of JSON data
    var htmlTemplate = ``;
    for (const [index, jsonData] of jsonDataArray.entries()) {
      // HTML template
      if (jsonData) {
        htmlTemplate += `
        <html>
        <head>
          <style>
            /* Add your custom styles here */
            body {
              margin: 0;
            }
            .certificate-container {
              position: relative;
              height: 150vh; 
              display: flex;
              text-align: center;
            }
            .background-img {
              position: absolute;
              width: 100%;
              height: 100%;
              object-fit: fill; /* Resize the image to fill the entire container, potentially distorting it */
              opacity: 1; /* Adjust the opacity as needed */
              z-index: 0;
            }
            .content {
              position: relative;
              z-index: 1;/* Set text color to white or any color that works with your background */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 100px; /* Adjust padding as needed */
            }
            .certificate-container h1 {
              position: absolute;
              top: 20%;
              left: 50%;
              color:#ddd207;
              transform: translateX(-50%) translateY(-50%); /* Rotate the heading */
              z-index: 1;
              font-size: 30px; /* Adjust font size as needed */
              font-family: Garamond, serif;;
              text-align: center;
            }
            .certificate-container h4 {
              color:#000000;
              font-size: 16px; /* Adjust font size as needed */
              font-family: Garamond, serif;
            }
            .content p {
              margin:10px 0;
              font-style:italic;
              font-size: 24px;
            }
            .field {
              position: absolute;
              bottom: 170px;
              right: 150px;
              z-index: 2;
            }
            /* Page break after each certificate */
            ${index < jsonDataArray.length - 1 ? '.certificate-container { page-break-after: always; }' : ''}
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <img class="background-img" src="${backgroundImage}" alt="Background" />
            <b><h1>Certificate of Participation</h1></b>
            <div class="content">
              <p>This is to certify that ${jsonData.Name} from ${jsonData.Department} department has participated in ${jsonData.Event}.</p>
            </div>
            <div class="field">
              <h4>${formatDate(new Date())}</h4>
            </div>
          </div>
        </body>
      </html>
              `;


      }

    }
    pdfPromises.push(
      new Promise((resolve) => {
        const pdfElement = document.createElement('div');
        pdfElement.innerHTML = htmlTemplate;

        html2pdf(pdfElement, {
          margin: 10,
          filename: `certificate.pdf`, // Adjust filename dynamically
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { scale: 3 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }).output('blob').then(resolve);
      })
    );

  };

  return (
    <div>
      <h1>Certificate Generator</h1>
      <input type="file" onChange={handleFileUpload} />
      {excelData.length > 0 && (
        <>
          <button onClick={generateCertificate}>Generate All Certificates</button>
        </>
      )}
    </div>
  );
};

export default CertificateGenerator;
