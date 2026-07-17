import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import { seedCustomer, uniqueEmail } from "../helpers/factories";

describe("Integration: Auth Routes", () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  describe("POST /api/v1/auth/register", () => {
    test("should reject registration when required fields are missing", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Missing Fields",
        email: uniqueEmail("register"),
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject a password shorter than six characters", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Short Password",
        email: uniqueEmail("register"),
        phoneNumber: "9800000000",
        password: "123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject a phone number shorter than ten digits", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Short Phone",
        email: uniqueEmail("register"),
        phoneNumber: "98000",
        password: "secret123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should register a new customer", async () => {
      const email = uniqueEmail("register");
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "New Customer",
        email,
        phoneNumber: "9800000000",
        password: "secret123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User created successfully");
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.role).toBe("customer");
    });

    test("should reject a duplicate email", async () => {
      const email = uniqueEmail("register");
      const payload = {
        fullName: "First Customer",
        email,
        phoneNumber: "9800000000",
        password: "secret123",
      };

      await request(app).post("/api/v1/auth/register").send(payload);
      const res = await request(app).post("/api/v1/auth/register").send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    test("should login with valid credentials and return a token", async () => {
      const { user, password } = await seedCustomer();

      const res = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(user.email);
    });

    test("should reject login with a wrong password", async () => {
      const { user } = await seedCustomer();

      const res = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "wrong-password",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject login with an unknown email", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: uniqueEmail("unknown"),
        password: "secret123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject login when fields are missing", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: uniqueEmail("nopass"),
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject login for an inactive account", async () => {
      const { user, password } = await seedCustomer({ status: "inactive" });

      const res = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password,
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/auth/whoami", () => {
    test("should reject access without a token", async () => {
      const res = await request(app).get("/api/v1/auth/whoami");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return the current user with a valid token", async () => {
      const { token, user } = await seedCustomer();

      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });
  });
});
