import {Component, createResource, JSX} from "solid-js"

export interface HFetchLocationAddressProps {
	longitude: number
	latitude: number
	children: (address: () => string) => JSX.Element
}

const HFetchLocationAddress: Component<HFetchLocationAddressProps> = (
	props: HFetchLocationAddressProps,
): JSX.Element => {
	const [address] = createResource(
		async () => {
			const response = await fetch(
				`https://geocode.maps.co/reverse?lat=${props.latitude}&lon=${props.longitude}`,
			)

			const data = await response.json()

			return data.display_name
		},
		{
			initialValue: `${props.latitude}, ${props.longitude}`,
		},
	)

	return props.children(address)
}

export default HFetchLocationAddress
