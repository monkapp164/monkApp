package com.monkapp.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.monkapp.entity.*;
import com.monkapp.exception.ResourceNotFoundException;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final ClienteRepository clienteRepository;
    private final VentaRepository ventaRepository;
    private final AbonoRepository abonoRepository;
    private final UsuarioRepository usuarioRepository;

    public byte[] historialCliente(Long clienteId) throws Exception {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario u = usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Cliente c = clienteRepository.findByIdAndUsuario(clienteId, u)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        List<Venta> ventas = ventaRepository.findByClienteAndUsuario(c, u);
        List<Abono> abonos = abonoRepository.findByClienteAndUsuarioOrderByFechaDesc(c, u);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 60, 40);
        PdfWriter.getInstance(doc, out);
        doc.open();

        BaseColor morado = new BaseColor(108, 99, 255);
        BaseColor verde = new BaseColor(40, 167, 69);
        BaseColor rojo = new BaseColor(220, 53, 69);
        Font fTitulo = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, morado);
        Font fHeader = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
        Font fBody = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.DARK_GRAY);
        Font fSub = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.DARK_GRAY);
        Font fDeuda = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, rojo);

        Paragraph titulo = new Paragraph("MonkApp — Historial de Cliente", fTitulo);
        titulo.setAlignment(Element.ALIGN_CENTER);
        titulo.setSpacingAfter(4);
        doc.add(titulo);

        Paragraph generado = new Paragraph(
                "Generado el " + java.time.LocalDate.now()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), fBody);
        generado.setAlignment(Element.ALIGN_CENTER);
        generado.setSpacingAfter(20);
        doc.add(generado);

        PdfPTable info = new PdfPTable(2);
        info.setWidthPercentage(100);
        info.setSpacingAfter(20);
        addInfoCell(info, "Nombre", c.getNombre(), fBody);
        addInfoCell(info, "Teléfono", c.getTelefono() != null ? c.getTelefono() : "—", fBody);
        addInfoCell(info, "Correo", c.getCorreo() != null ? c.getCorreo() : "—", fBody);
        addInfoCell(info, "Saldo Pendiente", "$ " + c.getDeudaTotal().toPlainString(), fDeuda);
        doc.add(info);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yy");

        if (!ventas.isEmpty()) {
            Paragraph p = new Paragraph("Ventas / Préstamos", fSub);
            p.setSpacingAfter(6);
            doc.add(p);
            PdfPTable t = new PdfPTable(new float[]{2, 3, 2, 2});
            t.setWidthPercentage(100);
            t.setSpacingAfter(20);
            for (String h : new String[]{"Fecha", "Concepto", "Total", "Saldo"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fHeader));
                cell.setBackgroundColor(morado);
                cell.setPadding(7);
                t.addCell(cell);
            }
            for (Venta v : ventas) {
                t.addCell(new Phrase(v.getFecha().format(fmt), fBody));
                t.addCell(new Phrase(v.getConcepto() != null ? v.getConcepto() : "Venta", fBody));
                t.addCell(new Phrase("$" + v.getTotal().toPlainString(), fBody));
                t.addCell(new Phrase("$" + v.getSaldoPendiente().toPlainString(), fBody));
            }
            doc.add(t);
        }

        if (!abonos.isEmpty()) {
            Paragraph p = new Paragraph("Abonos Recibidos", fSub);
            p.setSpacingAfter(6);
            doc.add(p);
            PdfPTable t = new PdfPTable(new float[]{2, 4, 2});
            t.setWidthPercentage(100);
            for (String h : new String[]{"Fecha", "Título", "Monto"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fHeader));
                cell.setBackgroundColor(verde);
                cell.setPadding(7);
                t.addCell(cell);
            }
            for (Abono a : abonos) {
                t.addCell(new Phrase(a.getFecha().format(fmt), fBody));
                t.addCell(new Phrase(a.getTitulo(), fBody));
                t.addCell(new Phrase("$" + a.getMonto().toPlainString(), fBody));
            }
            doc.add(t);
        }

        doc.close();
        return out.toByteArray();
    }

    private void addInfoCell(PdfPTable t, String label, String value, Font fVal) {
        Font fLabel = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.GRAY);
        PdfPCell l = new PdfPCell(new Phrase(label, fLabel));
        l.setBorder(Rectangle.BOTTOM);
        l.setPadding(6);
        PdfPCell v = new PdfPCell(new Phrase(value, fVal));
        v.setBorder(Rectangle.BOTTOM);
        v.setPadding(6);
        t.addCell(l);
        t.addCell(v);
    }
}
