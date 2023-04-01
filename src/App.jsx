import "./index.css"
import CaveLocationPointsSVG from "./cave-location-points.svg"
import Text from "./Text"
import Paper from "./Paper"
import {FaSolidLocationArrow, FaSolidServer} from "solid-icons/fa"
import {HiSolidCloud} from "solid-icons/hi"

function App() {
	return (
		<div class="relative">
			<img
				src={CaveLocationPointsSVG}
				class="h-screen right-0 top-0 bottom-0 absolute object-cover"
			/>

			<main class="h-screen w-full justify-center flex flex-row">
				<section class="basis-3/12 ml-6 flex flex-col gap-y-12 justify-center items-stretch">
					<div>
						<Paper title="Location" icon={FaSolidLocationArrow}>
							<Text variant="body">Secondary Street 5, San Seattle, USA</Text>
						</Paper>
					</div>
					<div>
						<Paper title="Saved Points" icon={HiSolidCloud}>
							<Text variant="body">9 location points</Text>
						</Paper>
					</div>
					<div>
						<Paper title="Relays" icon={FaSolidServer}>
							<Text variant="body">ws://relay.damus.io</Text>
						</Paper>
					</div>
				</section>
				<div class="basis-7/12 flex items-center flex-col">
					<Text variant="title">LOCUS</Text>
				</div>
				<div class="basis-3/12"></div>
			</main>
		</div>
	)
}

export default App
