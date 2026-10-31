function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    console.error('Error:', error.message);

    // JSON con formato incorrecto
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'El cuerpo de la solicitud debe contener JSON válido'
        });
    }

    // Email duplicado
    if (error.code === '23505') {
        return res.status(409).json({
            message: 'Ya existe un autor con ese email'
        });
    }

    // Autor inexistente al guardar una publicación
    if (error.code === '23503') {
        return res.status(404).json({
            message: 'Autor no encontrado'
        });
    }

    return res.status(500).json({
        message: 'Error interno del servidor'
    });
}

module.exports = errorHandler;