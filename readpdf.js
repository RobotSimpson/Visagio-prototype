const fs = require('fs');
const pdf = require('pdf-parse');

const buildPlanPath = 'src/app/vendor/dashboard/NegotiateAI_Build_Plan.docx.pdf';
const contextDocPath = 'src/app/vendor/dashboard/NegotiateAI_Context_Document.docx.pdf';

async function parsePdfs() {
    try {
        let dataBuffer = fs.readFileSync(buildPlanPath);
        let data = await pdf(dataBuffer);
        fs.writeFileSync('build_plan.txt', data.text);

        let dataBuffer2 = fs.readFileSync(contextDocPath);
        let data2 = await pdf(dataBuffer2);
        fs.writeFileSync('context.txt', data2.text);
        
        console.log('Successfully wrote build_plan.txt and context.txt');
    } catch (err) {
        console.error(err);
    }
}
parsePdfs();
