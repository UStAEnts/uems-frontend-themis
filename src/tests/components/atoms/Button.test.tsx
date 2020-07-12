import React from "react";
import {render, fireEvent} from "@testing-library/react";
import { Button } from "../../../components/atoms/button/Button";

describe('button', () => {
    it('should trigger parent on click', () => {
        const func = jest.fn();

        const {getByRole} = render(<Button color="#ffffff" text="Something" onClick={func}/>);

        // Double check that func has not been called when start the test
        expect(func).not.toBeCalled();
        // Click the button!
        fireEvent.click(getByRole('button'));
        // Make sure this fired the parents function
        expect(func).toHaveBeenCalled();
    })
})
