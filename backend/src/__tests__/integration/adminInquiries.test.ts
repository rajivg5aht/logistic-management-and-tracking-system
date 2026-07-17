import request from "supertest";
import app from "../../app";
import { InquiryModel } from "../../models/inquiry.model";
import { clearDatabase } from "../helpers/db";
import { authHeader, seedAdmin, seedCustomer, uniqueEmail } from "../helpers/factories";

const seedInquiry = () =>
  InquiryModel.create({
    fullName: "Question User",
    email: uniqueEmail("inquiry"),
    subject: "A question about my order",
    message: "Please tell me more about the delivery timeline",
  });

describe("Integration: Admin Inquiry Routes", () => {
  let adminToken: string;

  beforeAll(async () => {
    await clearDatabase();
    const admin = await seedAdmin();
    adminToken = admin.token;
  });

  describe("access control", () => {
    test("should reject requests without a token", async () => {
      const res = await request(app).get("/api/v1/admin/inquiries");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject a non-admin user", async () => {
      const customer = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/admin/inquiries")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("listing", () => {
    test("should return a paginated list of inquiries", async () => {
      const res = await request(app)
        .get("/api/v1/admin/inquiries")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    test("should return inquiry statistics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/inquiries/stats")
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET / PATCH / DELETE /api/v1/admin/inquiries/:id", () => {
    test("should return a single inquiry by id", async () => {
      const inquiry = await seedInquiry();

      const res = await request(app)
        .get(`/api/v1/admin/inquiries/${inquiry._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.data.subject).toBe(inquiry.subject);
    });

    test("should update an inquiry with an admin reply", async () => {
      const inquiry = await seedInquiry();

      const res = await request(app)
        .patch(`/api/v1/admin/inquiries/${inquiry._id}`)
        .set(authHeader(adminToken))
        .send({ adminReply: "Thank you for reaching out, we will help you" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should delete an inquiry", async () => {
      const inquiry = await seedInquiry();

      const res = await request(app)
        .delete(`/api/v1/admin/inquiries/${inquiry._id}`)
        .set(authHeader(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
