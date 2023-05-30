import React from 'react';
import {Checkbox} from '@mui/material';
import {Dict} from "./jira";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";

const DictionaryTable = (props: {
    selected: number[],
    setSelected: (data: number[]) => void,
    fields: Dict[],
    setFields: (data: Dict[]) => void
}) => {
    const {selected, setSelected, fields, setFields} = props

    const handleClick = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const newSelected = selected.includes(id)
            ? selected.filter((itemId) => itemId !== id)
            : [...selected, id];

        setSelected(newSelected);
    };
    const handleValueChange = (index: number, newValue: string) => {
        const updatedFields = [...fields];
        updatedFields[index].value = newValue;
        setFields(updatedFields);
    };

    const handleKeyChange = (index: number, newKey: string) => {
        const updatedFields = [...fields];
        updatedFields[index].key = newKey;
        setFields(updatedFields);
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <Grid container direction="row">
                    <Grid item xs={4} style={{paddingLeft: "7%"}}>
                        <strong>Название поля</strong>
                    </Grid>
                    <Grid item xs={4} style={{paddingLeft: "7%"}}>
                        <strong>Путь</strong>
                    </Grid>
                </Grid>
            </Grid>
            {fields.map((item, index) => (
                <Grid key={index} item xs={12}>
                    <Grid container direction="row" alignItems="center">
                        <Grid item>
                            <Checkbox checked={selected.indexOf(index) != -1}
                                      onChange={(event) => handleClick(event, index)}/>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                value={item.value}
                                onChange={(e) => handleValueChange(index, e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                value={item.key}
                                onChange={(e) => handleKeyChange(index, e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>

    );
};

export default DictionaryTable;
