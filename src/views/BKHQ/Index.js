import React from 'react'
import ReactFileReader from 'react-file-reader'
import { Button } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton';
import * as XLSX from 'xlsx'
import BackupIcon from '@material-ui/icons/Backup';
import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});
function createData(ID, docnum, money,) {
    return { ID, docnum, money };
}
export default function Index() {
    const classes = useStyles();
    const [tblBK,setTblBK] = React.useState({
        data:[]
    })
    const [tblSoCai, setTblSoCai] = React.useState({
        column: [
            'ID', 'Số chứng từ', 'Số tiền',
        ],
        data: []
    })
    const [socai, setSoCai] = React.useState({
        mess: []
    })
    const [bangke, setBangKe] = React.useState({})
    const [ketqua, setKetQua] = React.useState({
        date: '',
        data: [],
        compare: []
    })
    const handleFiles = files => {
        var reader = new FileReader();
        reader.onload = function (e) {
            // Use reader.result
            // alert(reader.result)
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            var title = ''
            var records = []
            var docnum = {}
            var datatable = []
            var totalmoney = 0
            data.map((i, e) => {
                if (e == 6) {
                    title = i[2]
                }
                if (e >= 10) {
                    if (i.length == 19) {
                        if (Number.isInteger(i[0])) {
                            totalmoney += i[17]
                            var cur = docnum[i[1]] == undefined ? [] : [...docnum[i[1]]]
                            cur.push(i[17])
                            docnum[i[1]] = cur
                            if (i[17] > 20000) {
                                const ID = i[0]
                                const DocNum = i[1]
                                const Money = Number(i[17]).toLocaleString()
                                records.push(`ID:${i[0]} - Số chứng từ ${i[1]} cập nhật dồn số tiền là ${Number(i[17]).toLocaleString()}`)
                                // datatable.push([i[0], i[1], i[17]])
                                datatable.push(createData(ID,DocNum,Money))
                            }
                        }
                    }
                }
            })
            setSoCai({
                date: title,
                mess: records,
                totalmoney: Number(totalmoney).toLocaleString(),
                data: docnum
            })
            setTblSoCai({
                ...tblSoCai,
                data: datatable
            })

        }
        // reader.readAsText(files[0]);
        reader.readAsBinaryString(files[0])
    }
    const handleFilesBK = files => {
        var reader = new FileReader();
        reader.onload = function (e) {
            // Use reader.result
            // alert(reader.result)
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            var title = ''
            var records = []
            var totalmoney = 0
            var docnumEmpty = []
            var compare = []
            data.map((i, e) => {
                if (e == 3) title = i[0]
                if (e >= 9) {
                    if (i.length >= 11 && Number.isInteger(i[0])) {
                        const id = i[0]
                        const docnum = i[2]
                        const money = Number(i[10]).toLocaleString()
                        if (CompareAndResearchEmp(docnum, money)) {
                            // docnumEmpty.push(`Chứng từ còn thiếu là ${docnum} - số tiền là ${Number(money).toLocaleString()}`)
                            docnumEmpty.push(createData(id,docnum,money))
                        }
                            
                        // if (!!CompareAndResearch(docnum, money))
                        //     compare.push(CompareAndResearch(docnum, money))
                        totalmoney += i[10]
                    }
                }
            })
            setKetQua({
                date: title,
                data: docnumEmpty,
                compare: compare,
                totalmoney: Number(totalmoney).toLocaleString()
            })
        }

        reader.readAsBinaryString(files[0])
    }
    const CompareAndResearchEmp = (docnum, money) => {
        var totMoney = 0
        if (!socai.data) return 'Chưa nạp sổ cái'
        if (socai.data) {
            const reg = new RegExp(`${docnum}`, 'g')
            const findArray = Object.keys(socai.data).toString()
            if (!findArray.match(reg)) {
                return true
            }
        }
    }
    const CompareAndResearch = (docnum, money) => {
        if (!socai.data) return 'Chưa nạp sổ cái'
        if (socai.data) {
            const reg = new RegExp(`${docnum}`, 'g')
            const findArray = Object.keys(socai.data)
            findArray.map(i => {
                if (i.match(reg)) {
                    let value = socai.data[i].reduce((a, b) => a + b, 0)
                    if (value !== money) {
                        return `Chứng từ cập nhật không chính xác: ${docnum} số tiền lệch ${value}/${money}`
                    }
                }
            })
        }
    }
    return (
        <div>

            <GridContainer>
                <GridItem xs={12} md={6} xl={6}>
                    <ReactFileReader handleFiles={handleFiles} fileTypes={['.csv', '.xlsx', '.xls']}>
                        <Button >
                            <IconButton>
                                <BackupIcon />
                            </IconButton> Upload Sổ Cái
                        </Button>
                    </ReactFileReader>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>STT</TableCell>
                                    <TableCell align="left">Số chứng từ cập nhật dồn</TableCell>
                                    <TableCell align="left">Số tiền bị dồn</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tblSoCai.data.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell align="left"> {row.ID}</TableCell>
                                        <TableCell align="left">{row.docnum}</TableCell>
                                        <TableCell align="left">{row.money}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableRow>
                                    <TableCell colSpan="2">Tổng đếm được</TableCell>
                                <TableCell align="left"> {socai.totalmoney ? `${socai.totalmoney}` : null} </TableCell>
                                    
                                </TableRow>
                        </Table>
                    </TableContainer>
                    {/* {socai.date}
                    {
                    socai.mess.map(i => {
                        return <p>{i}</p>
                    })
                    }
                    {socai.totalmoney ? `Tổng tiền đếm được: ${socai.totalmoney}` : null} */}
                </GridItem>
                <GridItem xs={12} md={6} xl={6}>
                    <ReactFileReader handleFiles={handleFilesBK} fileTypes={['.csv', '.xlsx', '.xls']}>
                        <Button >
                            <IconButton>
                                <BackupIcon />
                            </IconButton> Upload Bảng Kê
                </Button>
                    </ReactFileReader>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>STT</TableCell>
                                    <TableCell align="left">Số chứng từ chưa cập nhật</TableCell>
                                    <TableCell align="left">Số tiền</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ketqua.data.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell align="left"> {row.ID}</TableCell>
                                        <TableCell align="left">{row.docnum}</TableCell>
                                        <TableCell align="left">{row.money}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableRow>
                                    <TableCell colSpan="2">Tổng đếm được</TableCell>
                                <TableCell align="left"> {ketqua.totalmoney ? `${ketqua.totalmoney}` : null} </TableCell>
                                    
                                </TableRow>
                        </Table>
                    </TableContainer>
                    {/* {ketqua.date}
                    <div>
                        {ketqua.data.map(i => {
                            return <p>{i}</p>
                        })}
                        {ketqua.compare.map(i => {
                            return <p>{i}</p>
                        })}
                    </div>
                    {ketqua.totalmoney ? `Tổng tiền đếm được: ${ketqua.totalmoney}` : null} */}
                </GridItem>
            </GridContainer></div>
    )
}