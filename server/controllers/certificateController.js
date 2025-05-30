import CertificateModel from "../models/certificateModel.js";

const CertificateController = {

    // Create a new certificate
  async generateCertificate(req, res, next) {
    try {
      const { course_id } = req.body;
      const user_id = req.user.id;
      
      if (!course_id) {
        throw new Error("Course ID is required");
      }
      
      // In a real app, you'd check if the user has completed the course
      // before generating a certificate
      
      const certificate = await CertificateModel.generate({ user_id, course_id });
      res.status(201).json({ success: true, certificate });
    } catch (error) {
      next(error);
    }
  },


  // Verify a certificate
  async verifyCertificate(req, res, next) {
    try {
      const { code } = req.params;
      
      if (!code) {
        throw new Error("Verification code is required");
      }
      
      const certificate = await CertificateModel.findByVerificationCode(code);
      
      if (!certificate) {
        return res.status(404).json({ success: false, message: "Certificate not found" });
      }
      
      res.json({ success: true, certificate });
    } catch (error) {
      next(error);
    }
  },


  // Get all certificates for a user
  async getUserCertificates(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const certificates = await CertificateModel.getUserCertificates(userId);
      res.json({ success: true, certificates });
    } catch (error) {
      next(error);
    }
  }
};

export default CertificateController;