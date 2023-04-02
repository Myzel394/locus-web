import {Component, createEffect, createSignal, For, JSX, Show} from "solid-js"
import CaveLocationPointsSVG from "./cave-location-points.svg"
import Text from "./Text"
import Paper from "./Paper"
import {FaSolidLocationArrow, FaSolidServer} from "solid-icons/fa"
import {HiSolidCloud} from "solid-icons/hi"
import subDays from "date-fns/subDays"
import RelayStatus from "./RelayStatus"
import useLocationPoints, {LocationPoint} from "./effects/use-location-points"
import FetchLocationAddress from "./FetchLocationAddress"
import LocationMap from "./LocationMap"
import DistanceMeter from "./DistanceMeter"
import LocationPointInformation from "./LocationPointInformation"
import {useMap} from "./MapProvider"
import WorldMap from "./WorldMap"
import {get as getCountryByCoords} from "country-iso"
import getCountryISO2 from "country-iso-3-to-2"

export interface ControlCenterProps {
	nostrRelays: string[]
	nostrPublicKey: string
	pgpViewPrivateKey: string
	pgpSignPublicKey: string
}

const ControlCenter: Component<ControlCenterProps> = (props: ControlCenterProps): JSX.Element => {
	const [locationPoints, allPointsLoaded] = useLocationPoints({
		relays: props.nostrRelays,
		pgpPrivateViewKey: props.pgpViewPrivateKey,
		pgpPublicSignKey: props.pgpSignPublicKey,
		startDate: subDays(new Date(), 7),
		nostrPublicKey: props.nostrPublicKey,
	})
	const [showGradient, setShowGradient] = createSignal<boolean>(true)
	const {locationPoint, setLocationPoint, goToPosition} = useMap()

	createEffect(() => {
		if (locationPoints().length > 0) {
			const lastPoint = locationPoints()[locationPoints().length - 1]

			setLocationPoint(lastPoint)
			goToPosition(lastPoint.latitude, lastPoint.longitude, allPointsLoaded())
		}
	})

	return (
		<div class="relative">
			<img
				alt=""
				src={CaveLocationPointsSVG}
				class="h-screen right-0 top-0 bottom-0 absolute object-cover z-0"
				style={{
					width: "40rem",
				}}
			/>

			<main class="h-screen justify-center flex flex-row">
				<section class="basis-3/12 w-full ml-6 flex flex-col gap-y-12 justify-center items-stretch">
					<div class="w-full">
						<WorldMap
							activeCountry={getCountryISO2(
								getCountryByCoords(
									locationPoint()?.latitude,
									locationPoint()?.longitude,
								),
							)}
						/>
					</div>
					<div>
						<Paper title="Location" icon={FaSolidLocationArrow}>
							<Show<boolean> when={locationPoint()}>
								<FetchLocationAddress
									longitude={locationPoint().longitude}
									latitude={locationPoint().latitude}
								/>
							</Show>
						</Paper>
					</div>
					<div>
						<Paper title="Saved Points" icon={HiSolidCloud}>
							<Text variant="body">{locationPoints().length} location points</Text>
						</Paper>
					</div>
					<div>
						<Paper title="Relays" icon={FaSolidServer}>
							<For<string[]> each={props.nostrRelays}>
								{relay => <RelayStatus url={relay} />}
							</For>
						</Paper>
					</div>
				</section>
				<div class="basis-6/12 flex items-center flex-col gap-y-3 py-5">
					<Text variant="title">LOCUS</Text>
					<Show<boolean> when={locationPoint()}>
						<LocationMap />
						<DistanceMeter />
					</Show>
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
										<LocationPointInformation point={point} />
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
