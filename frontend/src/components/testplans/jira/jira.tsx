import React, {useEffect, useState} from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import useStyles from "../styles.testplans";
import Grid from "@mui/material/Grid";
import DictionaryTable from "./dictionaryTable";
import TestPlanService from "../../../services/testplan.service";
import FormControl from "@mui/material/FormControl";
import {InputAdornment, OutlinedInput} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";

export interface Dict {
    key: string,
    value: string
}

const Jira = () => {
    const classes = useStyles();
    const [token, setToken] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [email, setEmail] = useState('');
    const [showToken, setShowToken] = React.useState(false);
    const [tokenError, setTokenError] = useState(false);
    const [subdomainError, setSubdomainError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [fields, setFields] = useState<Dict[]>([]);


    const validateSubdomain = (value: string): boolean => {
        const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        return regex.test(value);
    }

    const validateEmail = (value: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const isTokenValid = token !== '';
        const isSubdomainValid = validateSubdomain(subdomain);
        const isEmailValid = validateEmail(email);
        setTokenError(!isTokenValid);
        setSubdomainError(!isSubdomainValid);
        setEmailError(!isEmailValid);
        const selectedIssueKeys: Dict[] = fields.filter((_, index) => selected.includes(index))
        let newsel: { [key: string]: string } = {}
        selectedIssueKeys.map((dict) => newsel[dict.key] = dict.value)
        console.log(newsel)
        const userInfo = {
            email: email,
            subdomain: subdomain,
            token: token,
            selected_issue_keys: newsel
        }
        if (isTokenValid && isSubdomainValid && isEmailValid) {
            console.log(userInfo)
            TestPlanService.patchJiraUserInfo(userInfo).catch((e) => {
                console.log(e)
            })
        }
    };

    useEffect(() => {
        new Promise<Dict[]>(async (resolve) => {
            let allFields: Dict[] = []
            await TestPlanService.getFields().then((response) => {
                allFields = response.data
                setFields(allFields)
            })
            resolve(allFields)
        }).then((allFields) =>
            TestPlanService.getJiraUserInfo().then((response) => {
                    const data = response.data
                    setEmail(data.email)
                    setSubdomain(data.subdomain)
                    setToken(data.token)
                    const oldSelected: number[] = []
                    allFields.map((field, index) => {
                        if (field.key in data.selected_issue_keys) oldSelected.push(index)
                    })
                    setSelected(oldSelected)
                }
            )
        )

    }, [])

    return (
        <form className={classes.formTestPlan}
              onSubmit={handleSubmit} style={{ position: "relative" }}
        >
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row', minWidth: "40%"}}>
                    <div style={{width: "4%", minWidth: 120}}>
                        <div style={{paddingTop: "30px"}}>
                            Subdomain
                        </div>
                    </div>
                    <TextField
                        value={subdomain}
                        onChange={(event) => setSubdomain(event.target.value)}
                        className={classes.textFieldTestplansAndTests}
                        error={subdomainError}
                        variant="outlined"
                        margin="normal"
                        autoFocus={true}
                        required
                        fullWidth
                        helperText={subdomainError && 'Некорректный subdomain'}
                    />
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row', minWidth: "40%"}}>
                    <div style={{width: "4%", minWidth: 120}}>
                        <div style={{paddingTop: "30px"}}>
                            Email
                        </div>
                    </div>
                    <TextField
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={classes.textFieldTestplansAndTests}
                        error={emailError}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        helperText={emailError && 'Некорректный email'}
                    />
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row', minWidth: "40%"}}>
                    <div style={{width: "4%", minWidth: 120}}>
                        <div style={{paddingTop: "30px"}}>
                            Token
                        </div>
                    </div>
                    <FormControl
                        className={classes.textFieldTestplansAndTests}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                    >
                        <OutlinedInput
                            type={showToken ? 'text' : 'password'}
                            value={token}
                            autoComplete="off"
                            style={{paddingRight: "5%"}}
                            onChange={(event) => setToken(event.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowToken((show) => !show)}
                                        onMouseDown={(event) => event.preventDefault()}
                                        edge="end"
                                    >
                                        {showToken ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                </div>
                <div style={{flex: 1, display: "flex", maxWidth: "70%", flexDirection: 'column', paddingLeft: "15%"}}>
                    <div style={{paddingTop: "2%"}}>
                        Выберите поля, которые будут отображаться в всплывающей подсказке при наведении на ссылку.
                    </div>
                    <Grid style={{paddingBottom: 20}}>
                        <DictionaryTable selected={selected} setSelected={setSelected} fields={fields}
                                         setFields={setFields}/>
                    </Grid>
                </div>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        position: "fixed",
                        bottom: "10px",
                        right: "10px",
                        margin: "0px 3px 20px 5px",
                        width: "150px",
                        height: "45px",
                    }}
                >
                    Сохранить
                </Button>
            </div>
        </form>
    )
        ;
};

export default Jira;
