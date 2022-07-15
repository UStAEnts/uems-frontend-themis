import { TitleType } from '../Form';
import React, { useState } from 'react';
import { TextField } from '../../../../components/atoms/text-field/TextField';
import { Button } from '../../../../components/atoms/button/Button';
import { Theme } from '../../../../theme/Theme';

export type TitleEditorProps = {
	title: TitleType;
	onSave: (t: TitleType) => void;
};

const TitleEditor: React.FunctionComponent<TitleEditorProps> = (props) => {
	const { title, onSave } = props;
	const [titleContent, setTitleContent] = useState(title.text);

	return (
		<div>
			<TextField
				onChange={setTitleContent}
				name={'Title'}
				initialContent={titleContent}
			/>
			<Button
				color={Theme.BLUE}
				text={'Save'}
				onClick={() =>
					onSave({
						...title,
						text: titleContent,
					})
				}
			/>
		</div>
	);
};

export default TitleEditor;
