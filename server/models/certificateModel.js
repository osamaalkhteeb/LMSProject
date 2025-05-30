import { query } from "../config/db.js";
import crypto from "crypto";


const CertificateModel = {
 //We create a new certificate
    async generate({ user_id, course_id }) {
    // Generate a unique verification code
    const verificationCode = crypto.randomBytes(10).toString('hex');
    
    // Generate certificate URL (in a real app, this would create an actual certificate)
    const certificateUrl = `/certificates/${verificationCode}.pdf`;
    
    const { rows } = await query(
      "INSERT INTO certificates (user_id, course_id, certificate_url, verification_code) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, course_id, certificateUrl, verificationCode]
    );
    return rows[0];
  },

  //We find a certificate by its verification code
  async findByVerificationCode(code) {
    const { rows } = await query(
      `SELECT c.*, u.name as user_name, co.title as course_title 
       FROM certificates c 
       JOIN users u ON c.user_id = u.id 
       JOIN courses co ON c.course_id = co.id 
       WHERE c.verification_code = $1`,
      [code]
    );
    return rows[0];
  },

  //We find all certificates for a given user
  async getUserCertificates(userId) {
    const { rows } = await query(
      `SELECT c.*, co.title as course_title 
       FROM certificates c 
       JOIN courses co ON c.course_id = co.id 
       WHERE c.user_id = $1`,
      [userId]
    );
    return rows;
  }
};

export default CertificateModel;