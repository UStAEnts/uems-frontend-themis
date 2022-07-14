import React from 'react';
import './FileUpload.scss';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Theme } from '../../../theme/Theme';

export type FileUploadProps = {
	onFileSelect: (file: File) => void;
};

export type FileUploadState = {
	drag: boolean;
	error: string | undefined;
	chosen: boolean;
};

export class FileUpload extends React.Component<
	FileUploadProps,
	FileUploadState
> {
	private readonly dropRef: React.RefObject<HTMLDivElement>;

	private readonly inputRef: React.RefObject<HTMLInputElement>;

	constructor(props: Readonly<FileUploadProps>) {
		super(props);

		this.dropRef = React.createRef();
		this.inputRef = React.createRef();

		this.state = {
			drag: false,
			error: undefined,
			chosen: false,
		};
	}

	componentDidMount() {
		if (this.dropRef.current) {
			this.dropRef.current.addEventListener('dragenter', this.dragEnterHandler);
			this.dropRef.current.addEventListener('dragover', this.dragOverHandler);
			this.dropRef.current.addEventListener('dragleave', this.dragLeaveHandler);
			this.dropRef.current.addEventListener('drop', this.dropHandler);
		}
	}

	componentWillUnmount() {
		if (this.dropRef.current) {
			this.dropRef.current.removeEventListener(
				'dragenter',
				this.dragEnterHandler
			);
			this.dropRef.current.removeEventListener(
				'dragover',
				this.dragOverHandler
			);
			this.dropRef.current.removeEventListener(
				'dragleave',
				this.dragLeaveHandler
			);
			this.dropRef.current.removeEventListener('drop', this.dropHandler);
		}
	}

	private dragEnterHandler = (e: DragEvent) => {
		failEarlyStateSet(this.state, this.setState.bind(this), 'drag')(true);

		e.preventDefault();
		e.stopPropagation();
		return false;
	};

	private dragOverHandler = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		return false;
	};

	private dragLeaveHandler = (e: DragEvent) => {
		failEarlyStateSet(this.state, this.setState.bind(this), 'drag')(false);

		e.preventDefault();
		e.stopPropagation();
		return false;
	};

	private dropHandler = (e: DragEvent) => {
		// Make sure the browser doesn't do anything weird.
		e.stopPropagation();
		e.preventDefault();

		if (!e.dataTransfer) return false;

		if (e.dataTransfer.files.length === 1) {
			if (this.inputRef.current)
				this.inputRef.current.files = e.dataTransfer.files;
			this.props.onFileSelect(e.dataTransfer.files[0]);
			failEarlyStateSet(this.state, this.setState.bind(this), 'drag')(false);
			failEarlyStateSet(this.state, this.setState.bind(this), 'chosen')(true);
			// onFileSelect(e.dataTransfer.files[0]);
		} else {
			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'error'
			)('You can only place one file');
		}

		return false;
	};

	render() {
		return (
			<div className="file-upload">
				{this.state.error ? (
					<div className="error">{this.state.error}</div>
				) : undefined}
				<div
					ref={this.dropRef}
					className={`dropzone ${this.state.drag ? 'hovering' : ''} ${
						this.state.chosen ? 'chosen' : ''
					}`}
				>
					{this.state.chosen ? (
						<FontAwesomeIcon icon={faCheck} color={Theme.SUCCESS} />
					) : (
						'Drop file here'
					)}
				</div>
				<input ref={this.inputRef} type="file" multiple={false} />
			</div>
		);
	}
}
