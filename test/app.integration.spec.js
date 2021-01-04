const request = require("supertest");
const app = require("../app");

const connection = require("../connection");

describe("Test routes", () => {
  beforeEach((done) => connection.query("TRUNCATE bookmark", done));
  it('GET / sends "Hello World" as json', (done) => {
    request(app)
      .get("/")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expected = { message: "Hello World!" };
        expect(response.body).toEqual(expected);
        done();
      });
  });
  it("POST /bookmarks sends json error missing fields", (done) => {
    request(app)
      .post("/bookmarks")
      .send({})
      .expect(422)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expecting = { error: "required field(s) missing" };
        expect(response.body).toEqual(expecting);
        done();
      });
  });
  it("POST /bookmarks sends json success", (done) => {
    request(app)
      .post("/bookmarks")
      .send({ url: "https://jestjs.io", title: "Jest" })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expectings = {
          id: expect.any(Number),
          url: "https://jestjs.io",
          title: "Jest",
        };
        expect(response.body).toEqual(expectings);
        done();
      });
  });

  describe("GET /bookmarks/:id", () => {
    const testBookmark = { url: "https://nodejs.org/", title: "Node.js" };
    beforeEach((done) =>
      connection.query("TRUNCATE bookmark", () =>
        connection.query("INSERT INTO bookmark SET ?", testBookmark, done)
      )
    );

    it("GET /bookmarks/:id error when getting a bookmark from his id", (done) => {
      request(app)
        .get("/bookmarks/222222")
        .expect(404)
        .expect("Content-Type", /json/)
        .then((response) => {
          const expecteeed = { error: "Bookmark not found" };
          expect(response.body).toEqual(expecteeed);
          done();
        });
    });

    it("GET /bookmarks/:id success getting bookmark from his id", (done) => {
      request(app)
        .get("/bookmarks/1")
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response) => {
          const expected = { id: 1, ...testBookmark };
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });
});
