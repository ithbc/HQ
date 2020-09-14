import React from 'react'
import ReactFileReader from 'react-file-reader'
import { Button, Typography, TablePagination, ListItem, List, ListItemText } from '@material-ui/core'
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
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import FolderIcon from '@material-ui/icons/Folder';
import ListItemIcon from '@material-ui/core/ListItemIcon';
const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    cardTitle: {
        marginTop: "0",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    },
    button: {

    }
});
function createData(ID, docnum, company, money,) {
    return { ID, docnum, company, money };
}
export default function Index() {
    const classes = useStyles();
    const [totalCompany, setTotalCompany] = React.useState({
        data:[]
    })
    const [dataBangKe, setDataBangKe] = React.useState({
        data: [],
        docnum:[]
    })
    const [dataSoCai,setDataSoCai] = React.useState({
        docnum:[],
        data:[]
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
            var CTSC = []
            var SoCai = []
            data.map((i, e) => {
                if (e == 6) {
                    title = i[2]
                }
                if (e >= 10) {
                    if (i.length == 19) {
                        if (Number.isInteger(i[0])) {
                            const ID = i[0]
                            const Company = i[9]
                            const DocNum = String(i[1]).replace('-1','')
                            const Money = i[17]
                            console.log(Company.match(/(?=[0-9]).*.(?=\])/g) == null ? ID : '')
                            const mst = Company.match(/(?=[0-9]).*.(?=\])/g) !== null ? Company.match(/(?=[0-9]).*.(?=\])/g).toString() : 'null'
                            var curMSTMoney = mstCompany[String(`${mst} - ${Company.replace(/\[.*.\]/g,'')}`).trim()] == undefined ? []  : mstCompany[String(`${mst} - ${Company.replace(/\[.*.\]/g,'')}`).trim()] 
                            curMSTMoney.push(Money)
                            mstCompany[String(`${mst} - ${Company.replace(/\[.*.\]/g,'')}`).trim()] = curMSTMoney
                            CTSC.push(DocNum)
                            SoCai[DocNum] = Money
                            var cur = docnum[DocNum] == undefined ? [] : [...docnum[DocNum]]
                            cur.push(i[17])
                            docnum[DocNum] = cur
                            totalmoney += i[17]
                            if (i[17] > 20000) {
                                records.push(`ID:${i[0]} - Số chứng từ ${DocNum} cập nhật dồn số tiền là ${Number(i[17]).toLocaleString()}`)
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
            setDataSoCai({
                data:SoCai,
                docnum:CTSC
            })
            var result = []
            for(var i in mstCompany){
                let tongtien = mstCompany[i].reduce((a,b) => a+b,0)
                result.push([String(i).toUpperCase(),tongtien])
            }
            setTotalCompany({
                data:result
            })
            console.log(SoCai)
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
            var CTBK = []
            data.map((i, e) => {
                if (e == 3) title = i[0]
                if (e >= 9) {
                    if (i.length >= 11 && Number.isInteger(i[0])) {
                        const id = i[0]
                        const docnum = i[2]
                        const company = i[5]
                        const mst = company.match(/(?=[0-9]).*.(?=\])/g) !== null ? company.match(/(?=[0-9]).*.(?=\])/g).toString() : 'null'
                        const money = i[10]
                        var curMSTMoney = mstCompany[String(`${mst} - ${company.replace(/\[.*.\- /g,'')}`).trim()] == undefined ? [] : mstCompany[String(`${mst} - ${company.replace(/\[.*.\- /g,'')}`).trim()] 
                        curMSTMoney.push(money)
                        mstCompany[String(`${mst} - ${company.replace(/\[.*.\- /g,'')}`).trim()] = curMSTMoney
                        CTBK.push(String(docnum).trim())
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
                tonglech: tonglech,
                docnumBK:CTBK
            })
            var result = totalCompany.data
            let index = 0;
            var lastestResult = []
            for(var i in mstCompany){
                index++
                let tongtien = mstCompany[i].reduce((a,b) => a+b,0)
                lastestResult.push(...result.filter(i2 => {
                    const reg =  new RegExp(`.*${String(i).toUpperCase().replace(/ \-.*/g,'')}.*`,'g') 
                    if(String(i2[0]).match(reg) !== null) {
                        return i2.push(tongtien)
                    } 
                }))
                // var reg = new RegExp(`.*${String(i).toUpperCase().replace(/\-/g,'\-').replace(/[\(|\)]/g,'.*')}.*`,'g')
                var reg = new RegExp(`.*${String(i).toUpperCase().replace(/ \-.*/g,'')}.*`,'g')
                if(result.toString().match(reg) == null) {
                    lastestResult.push([String(i).toUpperCase(),null,tongtien])
                } 
            }
            setTotalCompany({
                data:lastestResult
            })
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
            const reg = new RegExp(`${docnum}=?\/`, 'g')
            const reg2 = new RegExp(`${docnum}=?\-1`, 'g')
            const findArray = Object.keys(socai.data)
            findArray.map(i => {
                if (i.match(reg)) {
                    console.log(socai.data)
                    let value = socai.data[i].reduce((a, b) => a + b, 0)
                    if (value !== money) {
                        return check = `Chứng từ cập nhật không chính xác: ${docnum} số tiền lệch - Sổ cái: ${Number(value).toLocaleString()}/ Bảng kê: ${Number(money).toLocaleString()}`
                    }
                }
                // else if(i.match(reg2)) {
                //     let value = socai.data[i].reduce((a, b) => a + b, 0)
                //     let value2 = bangke.data
                //     if (value !== money) {
                //         return check = `Chứng từ cập nhật không chính xác: ${docnum} số tiền lệch - Sổ cái: ${Number(value).toLocaleString()}/ Bảng kê: ${Number(money).toLocaleString()}`
                //     }
                // }
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
    const multiDataSet3 = [
        {
            columns: [ketqua.date],
            data: []
        },
        {
            columns: ['Mã số thuế', 'Sổ cái', 'Bảng kê' ],
            data:totalCompany.data
        }
    ];
    const exportTemplate = () => {
        return (
            <ExcelFile
                filename={socai.date}
                element={<Button className={classes.button}><IconButton size="small">
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
    React.useEffect(() => {
        if(ketqua.data.length > 0) {
            const unique = (value, index, self) => {
                return self.indexOf(value) === index
              }
            const dataUnique = dataSoCai.docnum.filter(unique)
            const dataUniqueBK = ketqua.docnumBK.filter(unique)
            var result = []
            var money = 0
            dataUnique.filter(i => {
                const docnum = i.split('/') ? i.split('/')[0] : null
                const reg = new RegExp(`${docnum}`,'g')
                
                if(dataUniqueBK.toString().match(reg) !== null) {
                    return 
                } else {
                    money += dataSoCai.data[i]
                    result.push(`Chứng từ tồn tại trong sổ cái nhưng không có trong bảng kê: ${i} - ${Number(dataSoCai.data[i]).toLocaleString()}`)
                }
                
            })
            result.push(`Tổng tiền lệch Sổ Cái so với Bảng Kê là ${Number(money).toLocaleString()}`)
            setKetQua({
                ...ketqua,
                compare:[
                    ...ketqua.compare,
                    ...result
                ]
            })
        }
    },[ketqua.date])
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

                </GridItem>
            </GridContainer>
            <GridContainer>
                <GridItem xs={12} xl={12} md={12}>
                    <Card>
                        <CardHeader color="info">
                            <h4 className={classes.cardTitle}>Thông tin gợi ý cần chỉnh sửa</h4>
                            {exportTemplate()}
                        </CardHeader>
                        <CardBody>
                            <List dense={true}>
                                {
                                    ketqua.compare.map(i => {
                                        return (
                                            <ListItem>
                                            <ListItemIcon>
                                              <ArrowRightIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={i}
                                            />
                                            </ListItem>
                                        )
                                    })
                                }
                            </List>
                        </CardBody>
                    </Card>

                </GridItem>
            </GridContainer>
        </div>
    )
}