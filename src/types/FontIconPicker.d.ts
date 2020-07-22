
declare module '@fonticonpicker/react-fonticonpicker' {

    type FontIconPickerType = {
        icons: string[] | number[] | {[key: string]: number | string},
        search?: string[] | {[key: string]: string[]},
        iconsPerPage?: number,
        theme?: string,
        onChange: Function,
        showCategory?: boolean,
        showSearch?: boolean,
        value?: string[] | number[] | number | string,
        isMulti?: boolean,
        renderUsing?: string,
        convertHex?: boolean,
        renderFunc?: Function,
        appendTo?: boolean | string,
        allCatPlaceholder?: string,
        searchPlaceholder?: string,
        noIconPlaceholder?: string,
        noSelectedPlaceholder?: string,
        closeOnSelect?: boolean,
    }

    function ReactFontIconPicker(props: FontIconPickerType);

    export = ReactFontIconPicker;

}
