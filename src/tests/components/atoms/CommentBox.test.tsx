import { render, fireEvent } from "@testing-library/react";
import { Button } from "../../../components/atoms/button/Button";
import React from "react";
import { CommentBox } from "../../../components/atoms/comment-box/CommentBox";

describe('commentbox', () => {
    it('should not trigger parent on empty box', () => {
        const func = jest.fn();

        const {getByRole} = render(<CommentBox contentClasses={[]} submitCommentHandler={func}/>);

        expect(func).not.toBeCalled();
        fireEvent.click(getByRole('button', {name: 'submit'}));
        expect(func).not.toBeCalled();
    });

    it('should not trigger parent on content without class', () => {
        const func = jest.fn();

        const {getByRole} = render(<CommentBox contentClasses={[]} submitCommentHandler={func}/>);

        expect(func).not.toBeCalled();
        fireEvent.input(getByRole('textbox'), {target: {value: 'some content'}});
        fireEvent.click(getByRole('button', {name: 'submit'}));
        expect(func).not.toBeCalled();
    });

    it('should not trigger parent no content but class selected', () => {
        const func = jest.fn();

        const {getByRole, getByText} = render(<CommentBox contentClasses={[
            {
                id: '',
                name: 'Something',
            }
        ]} submitCommentHandler={func}/>);

        expect(func).not.toBeCalled();
        // Now we need to simulate naturally clicking the select box
        fireEvent.click(getByRole('button', {name: 'launch-menu'})) // Open the menu
        fireEvent.click(getByText('Something')) // Click an option

        fireEvent.click(getByRole('button', {name: 'submit'}));
        expect(func).not.toBeCalled();
    });

    it('should trigger parent on valid entry', () => {
        const func = jest.fn();

        const {getByRole, getByText} = render(<CommentBox contentClasses={[
            {
                id: '',
                name: 'Something',
            }
        ]} submitCommentHandler={func}/>);

        expect(func).not.toBeCalled();
        // Now we need to simulate naturally clicking the select box
        fireEvent.click(getByRole('button', {name: 'launch-menu'})) // Open the menu
        fireEvent.click(getByText('Something')) // Click an option

        fireEvent.input(getByRole('textbox'), {target: {value: 'some content'}}); // Enter a value
        fireEvent.click(getByRole('button', {name: 'submit'}));
        expect(func).toBeCalled();
    });
})
