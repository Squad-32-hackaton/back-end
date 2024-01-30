import { Router } from "express";
import { getUsers, addUser } from "../controllers/userController.js";
import { getProfile, loginUser } from "../controllers/loginController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json" assert { type: "json" };

const router = Router();

router.get("/users", getUsers);

// Criação de um usuário
router.post("/user", addUser);

// Home
router.get("/",(req,res)=>{
    res.json("home Page")
}); 

// Rota de login
router.post("/login", loginUser);

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// A partir daqui todas as rotas estão protegidas por Middleware
router.use(authMiddleware);

//profile
router.get("/login/profile", getProfile);

export default router;
