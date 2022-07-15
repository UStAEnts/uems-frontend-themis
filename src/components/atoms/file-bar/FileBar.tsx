import React from 'react';
import {
	faDownload,
	faFile,
	faGlobe,
	faLock,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Files.scss';
import { UEMSFile } from '../../../utilities/APIPackageGen';

export const FileBar: React.FunctionComponent<{
	file: UEMSFile;
}> = ({ file }) => (
	<div className="file-bar">
		<a href={file.downloadURL} target="_blank" rel="noopener noreferrer">
			<FontAwesomeIcon className="icon" icon={faFile} />
			<div className="name">
				{file.name} ({file.filename})
			</div>
			<div className="size">{file.size}</div>
			<FontAwesomeIcon className="icon" icon={faDownload} />
			<FontAwesomeIcon
				className="icon"
				icon={/*file.private*/ false ? faLock : faGlobe}
			/>
		</a>
	</div>
	// TODO: was there meant to be private files again
);

export const FileList: React.FunctionComponent<{
	files: UEMSFile[];
}> = ({ files }) => (
	<div className="file-list">
		<div className="title">Files</div>
		{files.map((e) => (
			<FileBar key={e.id} file={e} />
		))}
	</div>
);
