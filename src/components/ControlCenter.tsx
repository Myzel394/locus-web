import {Component, createEffect, createSignal, For, JSX, Show} from "solid-js"
import CaveLocationPointsSVG from "../assets/cave-location-points.svg"
import Text from "./Text"
import Paper from "./Paper"
import {FaSolidLocationArrow, FaSolidServer} from "solid-icons/fa"
import {HiSolidCloud} from "solid-icons/hi"
import subDays from "date-fns/subDays"
import RelayStatus from "./RelayStatus"
import useLocationPoints, {LocationPoint} from "../effects/use-location-points"
import FetchLocationAddress from "./FetchLocationAddress"
import LocationMap from "./LocationMap"
import DistanceMeter from "./DistanceMeter"
import LocationPointInformation from "./LocationPointInformation"
import {useMap} from "./MapProvider"
import WorldMap from "./WorldMap"
import CaveCountryBlobSVG from "../assets/cave-country-blob.svg"
import {get as getCountryByCoords} from "country-iso"
import getCountryISO2 from "country-iso-3-to-2"
import BackgroundMap from "./BackgroundMap"
import BatteryStatus from "./BatteryStatus"
import {DecryptionCredentials} from "../utils/get-decryption-key-from-nostr"

export type ControlCenterProps = DecryptionCredentials

const ControlCenter: Component<ControlCenterProps> = (props: ControlCenterProps): JSX.Element => {
	const [locationPoints, allPointsLoaded] = useLocationPoints({
		relays: props.relays,
		encryptionPassword: props.encryptionPassword,
		startDate: subDays(new Date(), 7),
		nostrPublicKey: props.nostrPublicKey,
	})
	const [showGradient, setShowGradient] = createSignal<boolean>(true)
	const {locationPoint, map, setLocationPoint, goToPosition} = useMap()

	createEffect(() => {
		if (locationPoints().length > 0) {
			const lastPoint = locationPoints()[locationPoints().length - 1]

			setLocationPoint(lastPoint)
			goToPosition(lastPoint.latitude, lastPoint.longitude, allPointsLoaded())
		}
	})

	return (
		<div class="relative">
			<Show when={map() && locationPoint()}>
				<BackgroundMap />
			</Show>

			<img
				alt=""
				src={CaveLocationPointsSVG}
				class="h-screen right-0 top-0 bottom-0 absolute object-cover z-10"
				style={{
					width: "40rem",
				}}
			/>

			<main class="h-screen justify-center flex flex-row">
				<section class="basis-3/12 w-full ml-6 flex flex-col justify-between items-stretch z-20">
					<div class="w-full relative">
						<img src={CaveCountryBlobSVG} class="absolute left-0 top-0 w-full h-full" />
						<Show<boolean> when={locationPoint()}>
							<div class="relative w-full h-full left-0 top-0 p-20">
								<WorldMap />
							</div>
						</Show>
					</div>
					<div class="flex flex-col gap-y-12">
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
					</div>
					<div />
				</section>
			</main>
		</div>
	)
}

export default ControlCenter
