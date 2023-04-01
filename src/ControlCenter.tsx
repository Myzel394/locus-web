import {Component, createResource, createSignal, For, JSX} from "solid-js"
import CaveLocationPointsSVG from "./cave-location-points.svg"
import Text from "./Text"
import Paper from "./Paper"
import {FaSolidCircle, FaSolidClock, FaSolidLocationArrow, FaSolidServer} from "solid-icons/fa"
import {HiSolidCloud} from "solid-icons/hi"
import fetchLocationPoints, {
	FetchLocationPointsData,
	LocationPoint,
} from "./fetchers/fetch-location-points"
import subDays from "date-fns/subDays"
import {format} from "date-fns"

export interface ControlCenterProps {
	nostrRelays: string[]
	nostrPublicKey: string
	pgpViewPrivateKey: string
	pgpSignPublicKey: string
}

const ControlCenter: Component<ControlCenterProps> = (props: ControlCenterProps): JSX.Element => {
	const [locationPoints] = createResource(
		{
			relays: props.nostrRelays,
			pgpPrivateViewKey: props.pgpViewPrivateKey,
			pgpPublicSignKey: props.pgpSignPublicKey,
			startDate: subDays(new Date(), 7),
			nostrPublicKey: props.nostrPublicKey,
		} as FetchLocationPointsData,
		fetchLocationPoints,
		{
			initialValue: [],
		},
	)
	const [showGradient, setShowGradient] = createSignal<boolean>(true)

	return (
		<div class="relative">
			<img
				src={CaveLocationPointsSVG}
				class="h-screen right-0 top-0 bottom-0 absolute object-cover z-0"
				style={{
					width: "40rem",
				}}
			/>

			<main class="h-screen justify-center flex flex-row">
				<section class="basis-3/12 w-full ml-6 flex flex-col gap-y-12 justify-center items-stretch">
					<div>
						<Paper title="Location" icon={FaSolidLocationArrow}>
							<Text variant="body">Secondary Street 5, San Seattle, USA</Text>
						</Paper>
					</div>
					<div>
						<Paper title="Saved Points" icon={HiSolidCloud}>
							<Text variant="body">{locationPoints().length} location points</Text>
						</Paper>
					</div>
					<div>
						<Paper title="Relays" icon={FaSolidServer}></Paper>
					</div>
				</section>
				<div class="basis-6/12 flex items-center flex-col">
					<Text variant="title">LOCUS</Text>
				</div>
				<div class="z-20 basis-3/12 flex flex-col items-end justify-center pr-5">
					<Text variant="heading-1" class="text-right">
						Location Points
					</Text>
					<div
						class="relative h-3/4 overflow-y-scroll"
						onscroll={event => {
							if (event.currentTarget.scrollTop === 0) {
								setShowGradient(true)
							} else {
								setShowGradient(false)
							}
						}}
					>
						<ul class="flex flex-col gap-y-6">
							<For<LocationPoint[]> each={locationPoints()}>
								{point => (
									<li>
										<Text variant="heading-2">
											{point.latitude}, {point.longitude}
										</Text>
										<div class="flex flex-row gap-x-2">
											<div class="flex flex-row gap-x-1 items-center">
												<div class="text-white">
													<FaSolidClock class="text-xs" />
												</div>
												<Text variant="information">
													{format(point.createdAt, "Pp")}
												</Text>
											</div>
											<div class="flex flex-row gap-x-1 items-center">
												<div class="text-white">
													<FaSolidCircle class="text-xs text-white" />
												</div>
												<Text variant="information">
													{point.accuracy.toFixed(0)}
												</Text>
											</div>
										</div>
									</li>
								)}
							</For>
						</ul>
						<div
							class="absolute pointer-events-none bg-gradient-to-b from-transparent to-locus-cave left-0 right-0 bottom-0 top-0"
							style={{
								opacity: showGradient() ? 1 : 0,
								transition: showGradient() ? "opacity 0.3s 0.7s" : "opacity 0.1s",
								willChange: "opacity",
							}}
						/>
					</div>
				</div>
			</main>
		</div>
	)
}

export default ControlCenter
