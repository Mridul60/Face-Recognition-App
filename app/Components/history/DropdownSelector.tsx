// /components/DropdownSelector.tsx
import React from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {StyleProp, ViewStyle} from 'react-native';

type DropdownProps = {
    data: any[];
    value: number;
    onChange: (item: any) => void;
    placeholder: string;
    style?: StyleProp<ViewStyle>;
};

const DropdownSelector = ({data, value, onChange, placeholder, style}: DropdownProps) => (
    <Dropdown
        data={data.map((label, index) => ({label, value: index}))}
        labelField="label"
        valueField="value"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={style}
        maxHeight={200}
        flatListProps={{
            initialScrollIndex: value,
            getItemLayout: (_, index) => ({ length: 40, offset: 40 * index, index }),
            scrollEnabled: true,
        }}
    />
);

export default DropdownSelector;
