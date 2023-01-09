import { Card, InputNumber, DatePicker, Space, TimePicker, Divider, Form, Typography } from "antd";
import dayjs from "dayjs";
import 'dayjs/locale/pt-BR';
import locale from 'antd/locale/pt_BR';
import ConfigProvider from "antd/es/config-provider";
import Button from "antd/es/button";
import * as XLSX from 'xlsx';
import { useRef, useState } from "react";

const { RangePicker } = DatePicker;
const format = 'HH:mm';

export function App() {
  const inputEl = useRef(null);
  const [periodo, setPeriodo] = useState(0);
  const [dataInicio, setdataInicio] = useState(dayjs);
  const [dataFim, setdataFim] = useState(dayjs);
  const [horaSelectionada, setHoraSelectionada] = useState(0);
  const [oferta, setOferta] = useState(0);
  let horarios: any[] = [];
  const [horario, setHorario] = useState(horarios);
  let bilhetesGerados: any = [];

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const onFinish = (values: any) => {
    const data = [['Data Início', 'Data Fim', 'Quantidade de Bilhetes']]; // Cabeçalho da tabela
    Gerar(values)
    bilhetesGerados.map((bilhete: any) => {
      data.push(bilhete)
    })
    //console.log(data)
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilha1');
    const element = document.createElement('a');
    const file = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' });
    element.href = URL.createObjectURL(file);
    element.download = "arquivo.xlsx";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  function gerarBilhetes(min: number, max: number) {
    return Math.round(Math.random() * (Math.round(max) - Math.round(min) + 1)) + Math.round(min);
  }

  function Gerar(value: any) {
    const frequenciaHora = Math.ceil(24 / horaSelectionada);
    const periodoData = periodo + dataInicio.date()

    for (let dia = dataInicio.date(); dia < periodoData; dia++) {
      for (let hora = 0; hora < frequenciaHora; hora++) {
        const horaTemp = hora * horaSelectionada
        const name = `horario${hora}`;
        const valorPorHora = value[name];

        const diaA = `${(dia < 10) ? `0${dia}/${dayjs(dataInicio).format('MM/YYYY')}` : `${dia}/${dayjs(dataInicio).format('MM/YYYY')}`} ${(horaTemp < 10) ? `0${horaTemp}` : `${horaTemp}`}:00`;
        const diaB = `${(dia < 10) ? `0${dia}/${dayjs(dataInicio).format('MM/YYYY')}` : `${dia}/${dayjs(dataInicio).format('MM/YYYY')}`} ${(horaTemp + horaSelectionada < 10) ? `0${horaTemp + horaSelectionada}` : `${horaTemp + horaSelectionada}`}:00`;
        const diaARef = dayjs(dayjs(dataInicio)).add(1, 'day').format('DD/MM/YYYY');
        const diaBParse = (horaTemp >= 23) ? `${dayjs(dataInicio).add(1, 'day').format('DD/MM/YYYY')} 00:00` : diaB;
        const bilheteria = `${(gerarBilhetes(value.ofertas / 1.5, value.ofertas) * valorPorHora)}`;
        const arrBilhetes = [diaA, diaBParse, bilheteria];
        bilhetesGerados.push(arrBilhetes);
        console.log(diaARef)
      }
    }
    console.log(bilhetesGerados)
  }
  const handlePeriodo = (date: any) => {
    if (date.length === 2) {
      const dataInicial = dayjs(date[0]);
      setdataInicio(dataInicial);
      const dataFinal = dayjs(date[1]);
      setdataFim(dataFinal)
      const dias = dataFinal.diff(dataInicial, 'day');
      setPeriodo(dias + 1);
    }
  };
  const handleFrequenciaHora = (value: any) => {
    if (value != null) {
      setHoraSelectionada(value.$H);
      const horaTemp = Math.ceil(24 / value.$H);
      for (let hora = 0; hora < horaTemp; hora++) {
        if ((value.$h * hora) < 10) {
          horarios.push(`0${value.$H * hora}:00`);
        } else {
          horarios.push(`${value.$H * hora}:00`);
        }
      }
      setHorario(horarios)
    }
  }

  return (
    <ConfigProvider locale={locale}>
      <Space>
        <Card
          bordered={false}
          style={{
            width: 480,
            background: '#1A1D1B',
            color: 'white',
            borderRadius: 4
          }}
        >
          <h1 style={{ textAlign: 'center' }}>Gerador de Bilhetes</h1>
          <Form
            onFinish={onFinish}
            //onFinish={Gerar}
            onFinishFailed={onFinishFailed}
          >
            <Space
              direction="vertical" size={4}
            >
              <Typography style={{ color: 'white' }}>Informe um período:</Typography >
              <Form.Item
                name="periodo"
                rules={[{ required: true, message: 'Informe o período!' }]}
              >
                <RangePicker
                  size="small"
                  style={{
                    borderRadius: 4
                  }}
                  onChange={handlePeriodo}
                />
              </Form.Item>
              <Typography style={{ color: 'white' }}>Informe a frequência de horas:</Typography >
              <Form.Item
                name="frequenciahoras"
                rules={[{ required: true, message: 'Informe a frequência!' }]}
              >
                <TimePicker
                  size="small"
                  format={format}
                  onChange={handleFrequenciaHora}
                />
              </Form.Item>
              <Typography style={{ color: 'white' }}>Média de ofertas por veículo:</Typography >
              <Form.Item
                name="ofertas"
                rules={[{ required: true, message: 'Informe a média de ofertas!' }]}
              >
                <InputNumber
                  size="small"
                />
              </Form.Item>

              <div>
                <Typography style={{ color: 'white' }}>Quantidade média de viagens por horário:</Typography >
                <Space
                  direction="horizontal" size="small"
                  wrap
                >
                  {
                    horario.map((i: any, idx: any) => {
                      if (parseInt(i.substr(0, 2)) < 10) {
                        return (
                          <div key={idx}>
                            <Typography style={{ color: 'white' }}>
                              {`0${i}`}
                            </Typography >
                            <Form.Item
                              name={`horario${idx}`}
                              rules={[{ required: true, message: 'Obrigatório!' }]}
                            >
                              <InputNumber size="small" />
                            </Form.Item>
                          </div>
                        )
                      } else {
                        return (
                          <div key={idx}>
                            <Typography style={{ color: 'white' }}>
                              {i}
                            </Typography >
                            <Form.Item
                              name={`horario${idx}`}
                              rules={[{ required: true, message: 'Obrigatório!' }]}
                            >
                              <InputNumber size="small" />
                            </Form.Item>
                          </div>
                        )
                      }
                    })
                  }
                </Space>
              </div>
            </Space>
            <Divider style={{ background: 'white' }} />
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Form.Item>
                <Button type="primary" htmlType="submit" ref={inputEl}>Gerar</Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
      </Space >
    </ConfigProvider >
  )
}