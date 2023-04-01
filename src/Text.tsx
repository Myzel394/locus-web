import {Component, JSX} from "solid-js"

export interface TextProps {
	variant:
		| "title"
		| "paper-title"
		| "heading-1"
		| "heading-2"
		| "body"
		| "caption"
		| "information"
	children: JSX.Element

	class?: string
}

// Add leading space to class prop so that other classes from the props can be appended
const VARIANT_CLASS_MAP: Record<TextProps["variant"], string> = {
	title: "text-6xl font-black text-white tracking-widest leading-normal ",
	"paper-title": "text-3xl font-black text-white leading-relaxed ",
	"heading-1": "text-5xl font-bold text-white leading-relaxed ",
	"heading-2": "text-2xl font-bold text-white leading-relaxed ",
	body: "text-base font-normal text-white leading-loose ",
	caption: "text-lg font-light text-white leading-loose ",
	information: "text-sm font-light text-white leading-loose ",
}

const Text: Component<TextProps> = (props: TextProps): JSX.Element => {
	switch (props.variant) {
		case "title":
			return <h1 class={VARIANT_CLASS_MAP[props.variant] + props.class}>{props.children}</h1>
		case "heading-1":
			return <h2 class={VARIANT_CLASS_MAP[props.variant] + props.class}>{props.children}</h2>
		case "paper-title":
			return <h3 class={VARIANT_CLASS_MAP[props.variant] + props.class}>{props.children}</h3>
		case "heading-2":
			return <h4 class={VARIANT_CLASS_MAP[props.variant] + props.class}>{props.children}</h4>
		case "body":
		case "caption":
		case "information":
			return <p class={VARIANT_CLASS_MAP[props.variant] + props.class}>{props.children}</p>
	}
}

export default Text
