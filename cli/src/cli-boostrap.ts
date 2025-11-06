import { Provider } from "@services/provider/provider";
import { Router } from "@services/router/router.service";
import { Routes } from "@services/router/routes";
import { CircleElement } from "@shared/element/circle.element";
import { HorizontalLineElement } from "@shared/element/horizontal-line.element";
import { RectangleElement } from "@shared/element/rectangle.element";
import { VerticalLineElement } from "@shared/element/vertical-line.element";

function	boostrap() {
	/*The main entrain to the program.*/
	new Provider();
	new Router().ft_setRoutes(Routes).ft_navigate("pong");
//	process.stdout.cursorTo(0,0);
//	process.stdout.clearScreenDown();
	/*Now we can draw rectangles!*/
	/*new HorizontalLineElement({x: 0, y: 0},{x: 21, y: 0}).ft_draw();
	new VerticalLineElement({x:0, y:0}, {x:0, y: 10}).ft_draw();
	new HorizontalLineElement({x: 0, y: 11}, {x: 21, y: 11}).ft_draw();
	new VerticalLineElement({x:20, y:0}, {x:20, y: 10}).ft_draw();
	new HorizontalLineElement({x: 0, y: 3},{x: 2, y: 3}).ft_draw();
	new VerticalLineElement({x:0, y:3}, {x:0, y: 5}).ft_draw();
	new HorizontalLineElement({x: 0, y: 5}, {x: 2, y: 5}).ft_draw();
	new VerticalLineElement({x:2, y:3}, {x:2, y: 5}).ft_draw();*/
	/*new RectangleElement({x:0, y:0}, {x: 100, y: 50}).ft_draw();
	new RectangleElement({x: 0, y: 22}, {x: 1, y: 27}).ft_draw();
	new RectangleElement({x: 99, y: 20}, {x: 100, y: 21}).ft_draw();
	new VerticalLineElement({x: 50, y:1}, {x:50, y: 49}).ft_draw();
	new CircleElement({x: 5, y: 5}, true).ft_draw();*/
		//process.stdout.moveCursor(0, 2);
}
boostrap();

