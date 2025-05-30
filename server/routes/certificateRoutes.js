import { Router } from "express";
import CertificateController from "../controllers/certificateController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/generate", authenticate, CertificateController.generateCertificate); // Generate certificate
router.get("/verify/:code", CertificateController.verifyCertificate);// Verify certificate
router.get("/user/:userId?", authenticate, CertificateController.getUserCertificates);// Get certificates for a user

export default router;