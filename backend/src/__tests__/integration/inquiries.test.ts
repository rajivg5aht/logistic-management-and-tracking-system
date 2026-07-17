import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import { authHeader, seedCustomer, uniqueEmail, SeededUser } from "../helpers/factories";

describe("Integration: Inquiry Routes", () => {
  let customer: SeededUser;

  beforeAll(async () => {
    await clearDatabase();
    customer = await seedCustomer();
  });

  describe("POST /api/v1/inquiries", () => {
    test("should create a public inquiry", async () => {
      const res = await request(app).post("/api/v1/inquiries").send({
        fullName: "Guest User",
        email: uniqueEmail("inquiry"),
        subject: "Question about delivery",
        message: "I would like to know more about your delivery services",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test("should reject an invalid public inquiry", async () => {
      const res = await request(app).post("/api/v1/inquiries").send({
        fullName: "A",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("customer inquiries", () => {
    test("should reject listing inquiries without a token", async () => {
      const res = await request(app).get("/api/v1/inquiries/my");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should list the customer's own inquiries", async () => {
      const res = await request(app)
        .get("/api/v1/inquiries/my")
        .set(authHeader(customer.token));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should create an inquiry for the logged-in customer", async () => {
      const res = await request(app)
        .post("/api/v1/inquiries/my")
        .set(authHeader(customer.token))
        .send({
          subject: "My recent shipment",
          message: "Please help me track my recent shipment order",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
