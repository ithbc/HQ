import React from 'react'
import ReactFileReader from 'react-file-reader'
import { Button, Typography, TablePagination } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton';
import * as XLSX from 'xlsx'
import ReactExport from "react-export-excel";
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
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});
function createData(ID, docnum, company, money,) {
    return { ID, docnum, company, money };
}
export default function Index() {
    const classes = useStyles();
    const [totalCompany,setTotalCompany] = React.useState({
        socai:{},
        bangke:{}
    })
    const [tblBK, setTblBK] = React.useState({
        data: []
    })
    const [tblSoCai, setTblSoCai] = React.useState({
        column: [
            'ID', 'Số chứng từ', 'Số tiền',
        ],
        data: [],
        exportFile: []
    })
    const [socai, setSoCai] = React.useState({
        mess: []
    })
    const [bangke, setBangKe] = React.useState({})
    const [ketqua, setKetQua] = React.useState({
        date: '',
        data: [],
        compare: [],
        exportFile: []
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
            var exportFile = []
            var mstCompany = {}
            data.map((i, e) => {
                if (e == 6) {
                    title = i[2]
                }
                if (e >= 10) {
                    if (i.length == 19) {
                        if (Number.isInteger(i[0])) {
                            const ID = i[0]
                            const Company = i[9]
                            const DocNum = i[1]
                            const Money = i[17]
                            const mst = Company.match(/(?=[0-9]).*.(?=\])/g) !== null ? Company.match(/(?=[0-9]).*.(?=\])/g).toString() : 'null'
                            
                            var curMSTMoney = mstCompany[mst] == undefined ? {...mstCompany[mst],socai:[]} : {... mstCompany[mst]}
                                curMSTMoney.socai.push(Money)
                                mstCompany[mst] = curMSTMoney
                            var cur = docnum[i[1]] == undefined ? [] : [...docnum[i[1]]]
                            cur.push(i[17])
                            docnum[i[1]] = cur
                            totalmoney += i[17]
                            if (i[17] > 20000) {
                                
                                records.push(`ID:${i[0]} - Số chứng từ ${i[1]} cập nhật dồn số tiền là ${Number(i[17]).toLocaleString()}`)
                                // datatable.push([i[0], i[1], i[17]])
                                datatable.push(createData(ID, DocNum, Company, Money))
                                exportFile.push([ID, DocNum, Company, Money])
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
                data: datatable,
                exportFile: exportFile
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
            var totalmoney = 0
            var docnumEmpty = []
            var compare = []
            var exportFile = []
            var tonglech = 0
            var mstCompany = {}
            data.map((i, e) => {
                if (e == 3) title = i[0]
                if (e >= 9) {
                    if (i.length >= 11 && Number.isInteger(i[0])) {
                        const id = i[0]
                        const docnum = i[2]
                        const company = i[5]
                        const mst = company.match(/(?=[0-9]).*.(?=\])/g) !== null ?  company.match(/(?=[0-9]).*.(?=\])/g).toString() : 'null'
                        const money = i[10]
                        var curMSTMoney = mstCompany[mst] == undefined ? {...mstCompany[mst],bangke:[]} : {... mstCompany[mst]}
                        curMSTMoney.bangke.push(money)
                        mstCompany[mst] = curMSTMoney
                        if (CompareAndResearchEmp(docnum, money)) {
                            docnumEmpty.push(createData(id, docnum, company, money))
                            tonglech += money
                            exportFile.push([id, docnum, company, money])
                        }
                        if (!!CompareAndResearch(docnum, money)) {
                            const value = CompareAndResearch(docnum, money)
                            compare.push(value)
                        }
                        totalmoney += i[10]
                    }
                }
            })
            setKetQua({
                date: title,
                data: docnumEmpty,
                compare: compare,
                totalmoney: Number(totalmoney).toLocaleString(),
                exportFile: exportFile,
                tonglech:tonglech
            })
            console.log(mstCompany)
            // var dataExport = []
            // for(var i in mstCompany) {
            //   dataExport.push([i,mstCompany[i].reduce((a, b) => a + b, 0)])
            // }
            // setTotalCompany({
            //     ...totalCompany,
            //     bangke:dataExport
            // })
        }

        reader.readAsBinaryString(files[0])
    }
    const CompareAndResearchEmp = (docnum, money) => {
        if (!socai.data) { return 'Chưa nạp sổ cái' }
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
            var check = ''
            const reg = new RegExp(`${docnum}`, 'g')
            const findArray = Object.keys(socai.data)
            findArray.map(i => {
                if (i.match(reg)) {
                    let value = socai.data[i].reduce((a, b) => a + b, 0)
                    if (value !== money) {
                        return check = `Chứng từ cập nhật không chính xác: ${docnum} số tiền lệch - Sổ cái: ${Number(value).toLocaleString()}/ Bảng kê: ${Number(money).toLocaleString()}`
                    }
                }
            })
            return check
        }
    }
    // export excel
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    const multiDataSet = [
        {
            columns: [socai.date],
            data: []
        },
        {
            columns: ['STT', 'Số chứng từ cập nhật dồn', 'Tên doanh nghiệp', 'Số tiền'],
            data: [...tblSoCai.exportFile]
        }
    ];
    const multiDataSet2 = [
        {
            columns: [ketqua.date],
            data: []
        },
        {
            columns: ['STT', 'Số chứng từ chưa cập nhật', 'Tên doanh nghiệp', 'Số tiền'],
            data: [...ketqua.exportFile]
        }
    ];
    const multiDataSet3= [
        {
            columns: [ketqua.date],
            data: []
        },
        {
            columns: ['Mã số thuế', 'Bảng kê', 'Sổ cái'],
            data: totalCompany.data
        }
    ];
    const exportTemplate = () => {
        return (
            <ExcelFile
                filename={socai.date}
                element={<Button className={classes.button}><IconButton>
                    <CloudDownloadIcon textRendering="Kết xuất dữ liệu" titleAccess="Kết xuất dữ liệu" textDecoration="Kết xuất dữ liệu" />
                </IconButton> Kết xuất dữ liệu</Button>}>
                <ExcelSheet dataSet={multiDataSet} name="Sổ cái">
                </ExcelSheet>
                <ExcelSheet dataSet={multiDataSet2} name="Bảng kê">
                </ExcelSheet>
                <ExcelSheet dataSet={multiDataSet3} name="Tổng tiền theo doanh nghiệp">
                </ExcelSheet>
            </ExcelFile>
        )
    }
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const [page2, setPage2] = React.useState(0);
    const [rowsPerPage2, setRowsPerPage2] = React.useState(10);

    const handleChangePage2 = (event, newPage2) => {
        setPage2(newPage2);
    };

    const handleChangeRowsPerPage2 = (event) => {
        setRowsPerPage2(+event.target.value);
        setPage2(0);
    };
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
                    <Typography variant="h6">{socai.date}</Typography>
                    <TableContainer component={Paper}>

                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>STT</TableCell>
                                    <TableCell align="left">Số chứng từ cập nhật dồn</TableCell>
                                    <TableCell align="left">Tên doanh nghiệp</TableCell>
                                    <TableCell align="left">Số tiền bị dồn</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tblSoCai.data.slice(page2 * rowsPerPage2, page2 * rowsPerPage2 + rowsPerPage2).map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell align="left"> {row.ID}</TableCell>
                                        <TableCell align="left">{row.docnum}</TableCell>
                                        <TableCell align="left">{row.company}</TableCell>
                                        <TableCell align="left">{Number(row.money).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableRow>
                                <TableCell colSpan="3">Tổng đếm được</TableCell>
                                <TableCell align="left"> {socai.totalmoney ? `${socai.totalmoney}` : null} </TableCell>

                            </TableRow>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={tblSoCai.data.length}
                        rowsPerPage={rowsPerPage2}
                        page={page2}
                        onChangePage={handleChangePage2}
                        onChangeRowsPerPage={handleChangeRowsPerPage2}
                    />
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
                    <Typography variant="h6">{ketqua.date}</Typography>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>STT</TableCell>
                                    <TableCell align="left">Số chứng từ chưa cập nhật</TableCell>
                                    <TableCell align="left">Tên doanh nghiệp</TableCell>
                                    <TableCell align="left">Số tiền</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ketqua.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell align="left"> {row.ID}</TableCell>
                                        <TableCell align="left">{row.docnum}</TableCell>
                                        <TableCell align="left">{row.company}</TableCell>
                                        <TableCell align="left">{Number(row.money).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableRow>
                                <TableCell colSpan="3">Tổng lệch chưa cập nhật</TableCell>
                                <TableCell align="left"> {ketqua.tonglech ? `${Number(ketqua.tonglech).toLocaleString()}` : null} </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan="3">Tổng đếm được</TableCell>
                                <TableCell align="left"> {ketqua.totalmoney ? `${ketqua.totalmoney}` : null} </TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={ketqua.data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </GridItem>
                <GridItem xs={12} md={12} xl={12}>
                    {
                        ketqua.compare.map(i => {
                            return(
                            <Typography variant="h6" color="error">{i}</Typography>
                            )
                        })
                    }
                </GridItem>
            </GridContainer>
            <GridContainer>
                <GridItem xs={12} xl={12} md={12}>
                    {exportTemplate()}
                </GridItem>
            </GridContainer>
        </div>
    )
}