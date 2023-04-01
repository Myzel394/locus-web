import {Component, JSX} from "solid-js"
import {IconTypes} from "solid-icons"
import Text from "./Text"
import styles from "./Paper.module.css"

export interface PaperProps {
	title: string
	children: JSX.Element
	icon: IconTypes
}

const Paper: Component<PaperProps> = ({title, children, icon: Icon}: PaperProps): JSX.Element => {
	return (
		<div class="flex flex-row items-center gap-x-2">
			<div class="basis-2/12 text-white">
				<Icon class="text-5xl" />
			</div>
			<div class={styles.Paper}>
				<Text variant="heading-1">{title}</Text>
				{children}
			</div>
		</div>
	)
}

export default Paper
