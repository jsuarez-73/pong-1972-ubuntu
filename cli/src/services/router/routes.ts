import { DashBoard } from "@viewmodel/dashboard/dashboard.viewmodel";
import { Login } from "@viewmodel/login.viewmodel";
import { PongCourt } from "@viewmodel/pong-court/pong-court.viewmodel";

export const Routes = [
	{
		path: "pong",
		viewmodel: PongCourt
	},
	{
		path: "dashboard",
		viewmodel: DashBoard
	},
	{
		path: "",
		viewmodel: Login
	}
];
