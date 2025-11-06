
export class	ModelDashBoardService implements ModelService {

	constructor () {
	}

	/*[!PENDING]: This is a mock to serves the data to the viewmodel.*/
	public	ft_seekMatchs(text: string): MatchResponse {
		return ({
			text: text,
			matchs: [
				{
					user: "jesus",
					status: 0
				},
				{
					user: "jesusE",
					status: 1
				},
				{
					user: "oLaScOaGa",
					status: 0
				},
				{
					user: "Escribano",
					status: 1
				},
				{
					user: "Leticia",
					status: 0
				},
				{
					user: "Eduardo",
					status: 1
				},
				{
					user: "Suarez",
					status: 0
				},
				{
					user: "jesus",
					status: 0
				},
				{
					user: "jesusE",
					status: 1
				},
				{
					user: "oLaScOaGa",
					status: 0
				},
				{
					user: "Escribano",
					status: 1
				},
				{
					user: "Leticia",
					status: 0
				},
				{
					user: "Eduardo",
					status: 1
				},
				{
					user: "Suarez",
					status: 0
				},
				{
					user: "jesus",
					status: 0
				},
				{
					user: "jesusE",
					status: 1
				},
				{
					user: "oLaScOaGa",
					status: 0
				},
				{
					user: "Escribano",
					status: 1
				},
				{
					user: "Leticia",
					status: 0
				},
				{
					user: "Eduardo",
					status: 1
				},
				{
					user: "Suarez",
					status: 0
				},
				{
					user: "jesus",
					status: 0
				},
				{
					user: "jesusE",
					status: 1
				},
				{
					user: "oLaScOaGa",
					status: 0
				},
				{
					user: "Escribano",
					status: 1
				},
				{
					user: "Leticia",
					status: 0
				},
				{
					user: "Eduardo",
					status: 1
				},
				{
					user: "Suarez",
					status: 0
				},
			]
		});
	}

	/*[!PENDING]: Implement correctly.*/
	public	ft_challengePlayer(user: string, cb: ((res: string) => void)): void {
		void user;
		cb("unimplemented");
	}

	public	ft_getChallenges(user: string): ChallengeResponse {
		void user;
		return ({
			challenges: [
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
				{
					user: "jesus"
				},
				{
					user: "Eduardo"
				},
				{
					user: "Suarez"
				},
				{
					user: "Buitrago"
				},
				{
					user: "Leticia"
				},
				{
					user: "Escribano"
				},
				{
					user: "Olascoaga"
				},
				{
					user: "Colombia"
				},
				{
					user: "España"
				},
			]
		});
	}

	public	ft_aceptChallenge(user: string, cb: ((res: string) => void)): void {
		void user;
		cb("unimplemented");
	}

	public	ft_rejectChallenge(user: string, cb: ((res: string) => void)): void {
		void user;
		cb("unimplemented");
	}
}
