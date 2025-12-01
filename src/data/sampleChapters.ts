// Estructura de capítulos organizados por partes
export interface Chapter {
    number: string;
    title: string;
    content: string;
}

export interface Part {
    partNumber: number;
    partTitle: string;
    chapters: Chapter[];
}

// PARTE 1: Nebulosa
export const PART_1_CHAPTERS: Chapter[] = [
    {
        number: "1",
        title: "Cielo Estrellado",
        content: `<p><strong>Cielo Estrellado</strong></p>

<p>Repinta las constelaciones, crea las tuyas. <em>Leí, escuché y escribí</em>. Una idea, así nace todo. Mi nacimiento fue una idea y mi calor también lo fue en un inicio.
Mi amor fue una idea y lo mismo mis obsesiones.</p>

<p>Las constelaciones fueron una idea, una imagen trazada en un plano sobre nuestras cabezas. Una idea dio vida a más ideas.
¿Entonces existe una idea primaria? </p>

<p>Se encontraba sentado en un asiento reclinado.
Las bocinas temblaban, las butacas repletas vibraban con los gritos de asombro de los niños. El planetario se movía con él; su cuerpo se levantaba y tambaleaba junto a la cúpula. Una proyección en el techo lo hacía sentir más que cualquier otra forma de arte.</p>

<p>La información brotaba y el narrador explicaba conceptos que él no lograba retener, pero la imagen era tan perfecta que sus oídos se cerraban.
Por primera vez vivía en silencio, y los choques y exclamaciones dejaban de importarle.</p>

<p><em>—…el nacimiento de una galaxia…—</em>
eran los pocos comentarios que su oído absorbía antes de volverse a cerrar.
<em>—…nacimiento de una estrella…—</em>
eran pensamientos fugaces que viajaban de sus ojos a su imaginación.</p>

<p>—Los ciclos de la vida de una estrella—, su propio nacimiento sucedía junto al de ellas. Levantaba la mano para intentar alcanzar su brillo, pero de nuevo se sentía atado al asiento acolchonado.</p>

<p>Ciclo de la vida de una estrella, ese comentario no salía de su mente mientras más y más cuerpos aparecían proyectados por la luz. No reconoce de donde venia, pero sabia que le gustaba. 
<em>Ciclos, ciclos, ciclos.</em>
Esa palabra giraba junto con los asientos.
<em>Ciclos, nacimiento, crecimiento, muerte. Nacimiento, crecimiento, muerte.</em></p>

<p>Naces, eres débil e indefenso, necesitas que te protejan y te hagan sentir seguro. Creces, aprendes a vivir y te vuelves más fuerte, necesitas que te hagan sentir seguro. Mueres, vuelves a ser indefenso, necesitas que alguien te vuelva a proteger.</p>

<p>Pero las estrellas no viven eso, las estrellas desde que nacían eran brillantes, vivían infinidades, crecían aún más en el proceso, brillaban cada vez más y morían cuando nadie se daba cuenta. Nunca se sentían en peligro, a menos no ocasionado por otros. No entendía de donde llegaban esas ideas, pero si sabia que ese momento las estaba generando.</p>

<p>Miraba a su alrededor y veía las siluetas de los demás niños iluminadas por destellos azules y rojizos. Ellos reían, se movían inquietos en sus butacas, como si las estrellas fueran solo fuegos artificiales dibujados en el techo. Para él no. Para él cada explosión llevaba escondida una pregunta, cada sombra un temor, cada luz un recuerdo que no sabía de dónde venía.</p>

<p>La voz del narrador retumbaba en la oscuridad, describía lo que tenía que pasar cada astro y el cómo su propio peso ocasionaba su desplome. En la cúpula, un esplendor furioso devoraba el cosmos. Su padre le apretó el hombro, susurrando: <em>—¿No es increíble, hijo?—</em>. Pero no podía respirar. No era increíble, era un recuerdo. Un eco de un futuro posible que vibraba en su pecho pequeño.</p>

<p>Y entonces la magia se apaga y el narrador se interrumpe, de nuevo escucha todo al alboroto de los demás niños y percibe el dolor de su cuello por la incómoda posición que mantuvo durante su viaje. Las luces del lugar se encienden y todos se comienzan a levantar buscando la señal de salida. Sus ojos no podían ver más arriba de las caderas de los demás y se dejaba guiar por la mano áspera, fría y pesada de su padre.</p>

<p>Su padre le preguntaba si le gustaba y solo recibía de su parte una mirada vacía y silencio. Los demás niños no paraban de hablar de lo colorido que era todo y se tironeaban para obligar a sus cuidadores a llevarlos por alguna chuchería. Brillo, su hijo, no hacia ni el mínimo gesto por comportarse como un niño. En el fondo sabía que así no era como se esperaba ser papá y conocía a la perfección como lucia su hijo pero le desconcertaba que aún no podría predecir los gustos del pequeño.</p>

<p>Durante su viaje de regreso el diminuto brillo no paraba de ver el relejo de las luces en la ventana del auto, mientras su padre no paraba de cambiar la estación de radio. Ni siquiera permitía el final de ninguna canción, ni de opinión, ni de idea.</p>

<p>El parabrisas era ahora otra cúpula y las luces de la ciudad se estiraban como cometas que se disolvían en la noche. Él las seguía con la mirada, dibujando líneas invisibles entre cada una. Era su manera de crear constelaciones nuevas: constelaciones que solo existían si él las nombraba, si él las unía. Y en ese juego silencioso, su padre era apenas una sombra que giraba el dial de la radio sin detenerse en nada.</p>

<p>Una estrella, había miles. ¿Qué le impedía a él ser una más? Sentirse como una más o, aunque le dijeran que era imposible, ser una. Es decir, se sentía, se veía, se reía y no estaba destinado a ninguna otra cosa distinta. Si él lo quería, podía ser una constelación. Repintara sus propias ideas y las uniría a todos.</p>

<p>Pero ser parte de las brillantes entonces también significaría aceptar todo de ellas. Soledad, lejanía y calor. </p>

<p>La soledad no le terminaba de convencer, le gustaba el cariño que le entregaban sus papás y la atención de sus amigos. ¿La lejanía le daba miedo, que pasaba si en algún momento necesitaba de ayuda y no había nadie para escucharlo? Estar apartados también lo tendría alejado de quien más lo quería. El calor, en cambio, no le parecía tan aterrador, ¿a quién no le gustaba sentirse abrigado por alguien? ¿Él podía abrigar a todos, cierto?</p>

<p>Idealizo su vida y creo una idea. Su idea primaria, podía ser una estrella y si lograba ser la mejor de ellas entonces junto a él nacería una verdadera. Su propia estrella a la que cuidaría y alimentaria para que ambos se amen y ninguno sufra las cosas malas de existir. La estrella nunca estaría sola, él no se sentiría con miedo. El estaría junto a ella y ella lo protegería. El recibiría su calor y nunca más sufriría frio.</p>

<p>Soñé que esa estrella nacía dentro y fuera de él como un secreto sagrado. Imaginaba su brillo tan fuerte que ningún vacío podría apagarlo. Pero en algún rincón de su mente también temía que, si dejaba de cuidarla por un instante, la estrella se apagase sin remedio, que explotara y nadie lo vería, como todas que mueren sin testigos en la oscuridad del espacio.</p>

<p><em>Ojalá nunca hubiera olvidado esa idea</em>, porque entonces nunca se hubiera traicionado a si mismo. Nunca hubiera provocado que su estrella, que su ciclo, que él, se consumiera más rápido de lo debía.</p>

<p>Esa noche, al volver a casa, miro sus manos bajo la luz de la lámpara, esperando verlas arder. Solo vio su piel común.</p>

<br><br><br><br>


<p style="text-align: left;"> <em>Para Brillo</em></p>
<p style="text-align: left;"><em>Persigue lo que encienda tu calor. Dibújalo, invéntalo, amalo o escríbelo. Da forma a tu amor y siempre habrá alguien que lo abrace contigo.<br>
No tengas miedo del fulgor, ya que yo seré él. Abre los ojos, mira hacia arriba. </em></p>

<p style="text-align: left;"> <em> Guárdate respeto, no traiciones el curso de tu propia vida. </em></p>

<p style="text-align: left;"><em>Que dentro y fuera de ti permanezca mi nombre, <strong>Noba</strong>.</em></p>

<br><br><br><br>
<p><strong>Amaneció Más Temprano</strong></p>

<p>Amaneció más temprano. O quizá fui yo el que se fue a la cama muy tarde. Otra vez el agua fría no logra despertarme; siento que un día me voy a enfermar por obligarme. Las noches duran cada vez menos. No recuerdo muy bien qué hice ayer, mucho menos por qué no descansé. El tiempo parece que me está cortando los pies. ¿Desde cuándo el sol quema tanto?</p>

<p>Déjame tomar el bus a tiempo. Hay días que parece que los conductores están siendo perseguidos por sus problemas. Otros, en los que ojalá fuera así. ¿Por qué me ves tanto? Mira hacia afuera, no veas mi reflejo en la ventana. No entiendo si te parezco atractivo o si te causo desconfianza. ¿Desde cuándo el sol sale de ese lado?</p>

<p>La calle está sucia. ¿Durante la noche la ensucian o esa basura es del día anterior? Nunca la había visto así. Tal vez no estoy acostumbrado a que mi cabeza exista a esta hora. ¿Otra vez están cerradas las calles? Otra vez llegaré tarde. ¿Por qué llego tarde? Cuando mi madre me llevaba al jardín, nunca llegué tarde. Siempre era el primero, a veces era el único.</p>

<p>No entiendo el afán de ese chico por ser siempre el primero en terminar. Otra vez no metí una aspirina en mi mochila. Me parece anticuada esa frase de "Al que madruga, Dios lo ayuda". Es un dicho que diría mi madre, pero no creo que funcione como motivación, especialmente cuando Dios es el mismo que provoca madrugar cada vez más. ¿Dios controlará las horas? No sé por qué estoy pensando eso.</p>

<p>¿Desde cuándo hace tanto calor en otoño? ¿O estábamos en verano? Acostumbraba a usar siempre un suéter sobre el pecho. Creo que ya no puedo usar esa excusa. Siento las miradas. Sé que no existen, pero las siento. No soy relevante y aun así las siento. ¿Mi cara se verá muy desgastada? Llevo una racha de varias semanas sin tener más de cuatro horas de sueño diario.</p>

<p>Fue una mala decisión salir de la casa de mi padre, aunque sinceramente pronto ya no hubiera habido casa. Es difícil concentrarse con tanto calor. ¿Por qué me va tan mal? ¿Por qué me tocó estar atrapado en este cuerpo? Tal vez con pelaje en mi piel no me molestaría tanto ese sol.</p>

<p>Dicen que me parezco a mi abuelo, ¿también el sufría con la luz? No lo conocí. No debería crear historias sobre él. Mi madre nunca me habló de él. En realidad, no hablaba mucho conmigo. Recuerdo que le gustaba mucho escuchar la brisa rozando los árboles y el sonido de las bellotas rompiéndose en el suelo. Debería ir a escucharlas ahora que es otoño... ¿o era verano? Ella nunca pensó que yo era alguien raro. Me contaba historias donde el protagonista podía viajar a través de sus sueños y conocer lugares que posiblemente nunca conoceré. No sé qué paso con ella. Creo que ella también tenía miedo y nunca me lo dijo. Puede que no le haya podido ayudar, pero por lo menos ahora no sentiría la duda.</p>

<p>Estoy cansado. El sol me mira todos los días. Sus rayos atraviesan mi piel y constantemente me ponen en peligro de morir. Qué sarcástico es cómo pintan al sol siempre con una sonrisa, viéndote directo a los ojos y mintiendo con su boca. Recuerdo que yo así lo hacía. Siempre dibujaba una casa, un perro, un árbol y al sol con una sonrisa. Me parecía alentador. Pero ahora, al amanecer siento que pierdo. Siento que debería haber cambiado respecto al día anterior, pero me siento exactamente igual. Todos los días me esfuerzo y al anochecer siempre siento que nunca vale la pena. Pero aun así lo sigo haciendo. No me rindo. Sigo saliendo a caminar, aunque no tenga tiempo. Sigo viendo por la ventana pasar a las personas, parejas, amigos, familias... aunque no pueda ser ellos. Debería hablarle a esa chica.</p>

<p>Siento que nunca me gustó el amanecer. Cuando era pequeño nunca me gustó la idea de comenzar cosas nuevas. Me daba miedo. Ahora siento que un día nuevo solo es el inicio de mis responsabilidades, cosas que yo no elegí, cosas que se me asignaron y que simplemente no quiero hacer, cosas que veo innecesarias, cosas que solo sirven para hacer mi vida más apagada y cerrada. Es irónico, el mismo sol que me mantiene vivo también intenta matarme todos los días. El sol, que simboliza la felicidad y la autorrealización, solo ha traído consigo estrés y desesperación.</p>

<p>Nunca lo digo, pero sí me comparo. Veo a otros lograr lo que a mí me cuesta incluso imaginar. Hay quienes sonríen desde temprano, quienes tienen rutinas pulidas, metas claras, motivación visible. Yo apenas logro despertar. Me comparo en secreto y luego me culpo por hacerlo. Y sin embargo, no dejo de hacerlo. Es como si te dieran un premio por cada vez que haces sentir insuficiente a las demás personas y todos sentimos que debemos ganarlo. Me pregunto si algún día lo ganare.</p>

<p>Otra vez veo un atardecer junto a mis plantas. Ellas sí disfrutan del sol. Otra vez me inundo de paz al pensar que ya he terminado con toda mi agenda, agenda que me mantiene encadenado. ¿Por qué el sol se encarga de juzgarme? Otro anochecer y de nuevo no avancé nada. No he escrito ese reporte. Otra vez siento incapacidad. Un día, una noche y se repite. Así de sencillos son todos los días. Me encantan los días lluviosos o los días nublados, siento que le dan variedad a mi rutina.</p>

<p>Dormir se volvió mi forma favorita de esconderme. No porque me guste soñar, sino porque al menos ahí no tengo que responderle a nadie, ni fingir interés en cosas que no me importan. A veces pienso que si pudiera dormir por semanas enteras, tal vez el mundo avanzaría sin mí, y eso sería un alivio. Otras veces temo quedarme dormido del todo y que nadie lo note.</p>

<p>Mi padre tampoco lo entendía. Un día nací y al siguiente brillaba, decía él. Me decía que cuando estaba junto a él, sentía como si un calor infernal lo quemara. Decía que estaba destinado a ser más grande que el resto. Decía que estaríamos juntos pasara lo que pasara.</p>

<p>El sol, como yo, es una estrella. Es un cuerpo inmenso destinado para ver cuerpos aún más pequeños girar sobre él, a ver a cada uno de ellos a miles de kilómetros y no poderse acercar. Destinado a morir tarde o temprano, solo y catastróficamente.</p>

<p>Y aunque me moleste, el sol y yo somos lo mismo. Ambos estamos tan cerca de todos en comparación con la inmensidad del universo, pero a la vez tan lejos para que alguien nos alcance. Ambos desintegraríamos a alguien con tan solo acercarse. Puede que ese sea su destino: vagar por el vacío manteniendo vivo a lo que pueda, esperando no dañar a nadie. Sabe que tarde o temprano morirá y, junto a él, muchos más. Puede que no esté listo y no sienta la necesidad de hablarlo. Debería hablarlo. Nos parecemos y me niego a aceptarlo. Me da miedo parecerme a algo que provoca tantas cosas negativas en las personas y en mí.</p>

<p>Bueno, yo también provoco mi propio daño.</p>

<p>¿Y si no es culpa de él? Tal vez no conoce lo que realmente pasa alrededor de su vida. Puede que, al igual que yo, esté encerrado y no pueda salir. En ese caso seríamos más parecidos de lo que imaginaba.</p>

<p>Creo que empecé a odiar al sol el día que dejó de calentarme. No fue de golpe, fue poco a poco. Al principio solo me molestaba que me despertara antes de tiempo, que me forzara a salir de la cama sin sentirme listo. Pero luego se convirtió en el símbolo de todo lo que no controlo, los horarios impuestos, las exigencias ajenas, las metas que no son mías. El sol me empuja sin preguntarme si quiero avanzar. Me expone cuando solo quiero pasar desapercibido. Me recuerda que el mundo sigue, incluso cuando yo no quiero visitarlo. Tal vez no lo odio por lo que es, sino por lo que representa. Y porque, de alguna manera, cada amanecer me grita que sigo sin estar donde quería. Si lo pienso bien, realmente no lo odio, de hecho, no odio a nada ni nadie. El odio es una expresión exagerada del rechazo y no lo rechazo del todo.</p>

<p>Aunque... no todo es feo durante el día. Si soy sincero, es hermoso recibir un poco de luz después de estar días escondido en el sofá. Es cómodo respirar aire limpio y que el viento te despeine. Es lindo cuando escuchas a los pájaros cantar a medio día, o cuando el aroma del pan recién horneado llega desde la panadería de la esquina. Y sin él no podría apreciar los arcoíris después de la lluvia.</p>

<p>Un perro que me mueve la cola sin conocerme. Una canción que suena en la tienda y me recuerda a mi infancia. En esos momentos, todo parece más lento. Esos pequeños momentos hacen que todo pese un poco menos. Y si no necesito ganarle al día, solo estar en él. Tal vez el sol no sea el enemigo... tal vez solo necesito aceptar cómo se siente.</p>

<p>Tal vez ese sea el aprendizaje que tanto he evitado, no todo lo que vale pesa, no todo lo que importa duele. </p>

<p>Me pregunto si, como el sol, también tengo un ciclo. Si habrá momentos donde podré brillar sin quemar.</p>

<p>El sol ha bajado. Ya no entra por la ventana con la misma fuerza. La ciudad sigue llorando, hay polvo flotando. Mis plantas se inclinan con calma listas para descansar. A veces eso basta. Sigo sin saber si era verano u otoño, pero esta vez no me importa. Hoy también amaneció. Y esta vez, aunque sea solo por unos segundos me mire al espejo.</p>

<br><br><br><br><br><br>

<p style="text-align: left;"> <em>Para la chica de rizos:</em></p>
<p style="text-align: left;"><em>Me gusta mucho ese guardapelo que siempre llevas, me recuerda mucho a los vitrales antiguos que filtran la luz de la tarde. ¿Te gustaría salir a tomar un café? El clima anda indeciso, pero hoy el sol se ha quedado más tiempo de lo habitual.<br>
Con cariño, <strong>Brillo</strong>.</em></p>


<br><br><br><br><br><br>

<p><strong>Canto de Aves</strong></p>

<p>Esperanza vacía. Cielo gris azulado.
El único ruido son los pájaros y los pasos sordos de quienes corren. La vida sube y baja como un latido irregular: no entiendo cómo todo cambia tan rápido.</p>

<p>Desde lejos, las personas parecen figuras cabizbajas, arrastradas por los autos y las andaderas.
Él —o yo, ya no sé— está sentado tres horas antes de lo acordado. Tres horas vacías. Tres vueltas dadas al parque, como si el cansancio se pudiera confundir con compañía.</p>

<p>“Preferiría haberme quedado en casa.”
Lo dice en voz baja, pero nadie responde.</p>

<p>Quizá habría sido lo mismo: acostarse, dormir, dejar que el sueño apague los pensamientos. Pero estar consciente también tiene su encanto. Saber que pienso. Saber que todavía soy capaz de escucharme, aunque nadie más lo haga.
La obsesión es esa: hablarse a sí mismo como si se tratara de una carta que nunca se enviará. El mejor verso de amor, la mejor frase de despecho, la cita de superación que nadie más leerá. Si lograra mirar más allá de la sombra de su propio cuerpo, más allá de lo que los lentes permiten, quizá podría escribirla.</p>

<p>El banco en el que está sentado no parece especial. Sin embargo, alguien más ha llorado aquí antes, sin duda. Los restos invisibles del dolor ajeno se mezclan con los suyos.</p>

<p>Y ahí, en medio del parque, con los pájaros interrumpiendo el silencio, aprende que estar solo no siempre significa estar vacío.</p>

<p>Con tanto tiempo recuerda e imagina. Imaginar le encanta, imaginar le hace creer que para algo existe. Si existe y puede imaginar entonces puede crear algo, ¿cierto?</p>

<p>“Me encantan las ardillas”, piensa él. Le gusta su forma, su color café tenue que le recuerda a su cabello. Su gran cola espirada que tiene un propósito único. Sus mejillas amplias y sus dientes tan particulares… todo en ellas tiene un porqué, todo en ellas le recuerda a algo.</p>

<p>El canto del viento golpeando las copas de los árboles suena como aquellas orquestas antiguas donde el talento y el arte se reflejaban por encima de la mente. Donde no se necesitaba conocer cada parte exacta para poder entenderla, para poder sentirla. Algo que siempre le ha gustado es eso peculiar de los árboles: están hechos de tantas hojas y ramas que nunca podrías saber cuál creció primero. Son tantas y tan iguales que se unen uniformemente para crear un conjunto infinito de momentos.</p>

<p>“Un árbol es tan lindo hasta que se seca.”
No hay frase que le cause más rabia que esa. Puede que haya otras a la par, pero esa solo ejemplifica una opinión corta y torpe de lo que realmente es. ¿Por qué juzgar algo tan inmenso por un momento específico de su vida? Claro está que no es lo mismo ver que sentir: ellos no sienten, solo ven. Un árbol es más que sus hojas; tal vez lo más importante es su tronco, esa estructura que guarda cientos y cientos de anillos de madera creados con los años, con los ciclos, con cada vez que las hojas han abandonado sus ramas.</p>

<p>Alice siempre le ha causado pavor. No por su forma de ser, sino porque si estuviera aquí no pararía de hablar de cómo cada árbol puede albergar decenas de especies animales y pasaría a citar con precisión cada nombre científico de ellas.
Es raro que alguien hable con tanto conocimiento de algo tan cotidiano, pero Alice no es lo que se definiría como normal.</p>

<p>Si estuviera ahí sentada junto a él, seguramente repetiría su historia de cómo subió a un árbol para alcanzar un gato, o aquella ocasión en que peleó contra un pato para salvar su collar.</p>

<p>—Un árbol nunca está muerto cuando pierde sus hojas —diría ella.
—Siempre dices lo mismo, Alice —respondería él.
—Y siempre me ignoras.</p>

<p>Sería interesante escucharla, si no fuera porque en algún punto reduce el tono de su voz al darse cuenta de que habla demasiado y no deja que nadie más opine.</p>

<p>La conoce desde hace mucho, pero nunca ha hablado de su hermana o de su madre. Es como si para ella los animales de cualquier árbol fueran más interesantes que las personas con las que convive todos los días. Quisiera ser como ella: despreocupada —o al menos eso parece—, sin deberle nada a nadie. No tener que imaginar más de lo necesario.</p>

<p>Pero para entonces se vuelve a dar cuenta de que está solo. Sentado, esperando solo y sin una sola alma conocida a su alrededor.
Imagina levantarse y hablarle a la primera persona que cruce su mirada; imaginaría inventar una amistad con la que pudiera conversar y sentir algo más que lo que un árbol es capaz de transmitirle. Pero claro, no lo hará. No puede hacerlo. Su nula practicidad con el habla lo condena a permanecer en silencio, aguardando.</p>

<p>La idea antigua de la orquesta lo vuelve a atropellar.
El bum de los tambores serían las cajas de los camiones golpeando al caer sobre un desnivel.
El sonido fino de los violines serían esos pequeños pájaros que cruzan velozmente en parvada.
Las trompetas se volverían los truenos de las nubes grises que anuncian un diluvio desde el abismo.
La viola, esos pequeños roces de los animales con el pasto y las hojas al desplazarse.
Los clarinetes, el chillido metálico de las rejas excitadas por el viento.</p>

<p>Y, como un coro inesperado, se imaginaría a sí mismo cantando. Su voz rompiendo el aire, acabando con el silencio espeso de su soledad.</p>

<p>El banco cruje bajo su peso y cada pequeño movimiento de su cuerpo se convierte en un sonido propio, como si fuera otro instrumento en la orquesta que inventa. Observa una hoja que gira lentamente antes de caer y se pregunta si esa misma hoja alguna vez estuvo en otro árbol, si alguna vez alguien la notó o le dio un nombre.</p>

<p>Se queda quieto un instante más, respirando el aire húmedo, sintiendo cómo los sonidos se mezclan. No hay aplausos, no hay espectadores, solo él y la sinfonía de la vida cotidiana que sigue ocurriendo a su alrededor.</p>

<p>El sol empieza a filtrarse entre las hojas, dibujando sombras que parecen moverse con su propio ritmo. Cada árbol tiene su historia en los anillos del tronco y él se pregunta cuántos secretos guarda cada corte de madera, cuántas voces silenciosas han habitado este parque antes que él.</p>

<p>A lo lejos, un perro ladra, por un instante imagina que es un mensajero enviado solo para romper su burbuja de silencio. Se inclina un poco hacia el sonido, listo para hablar, para inventar una conversación, pero las palabras se le escapan y vuelve a quedarse quieto. La paciencia no es un don suyo; es una obligación.</p>

<p>Se fija en un hormiguero junto a la base de un árbol. Las pequeñas criaturas llevan hojas que parecen demasiado grandes para ellas.</p>

<p>El viento le golpea la cara y el frío del banco se filtra por la espalda. Cada hoja que cae parece marcar un compás en su orquesta invisible. Los pájaros pasan rápido, en parvadas que dibujan trayectorias imposibles, él imagina que sus voces crean melodías que nadie más escuchará.
Se sorprende a sí mismo hablando en voz baja, como si alguien pudiera contestarle desde la distancia:
—¿Me escuchas? —susurra—. No hay nadie. Solo el eco de mis propias palabras.</p>

<p>Su sombra se mueve con el sol que empieza a filtrarse entre las copas. La observa y piensa que, aunque es solo un reflejo de su cuerpo, también es compañía. Quizá nunca tuvo que temerle tanto a la soledad: él es la soledad, esperando paciente.</p>

<p>Imagina que Alice aparece de repente entre los árboles, pero no la ve; la siente. Su risa corta el aire, y él, silencioso, se permite sonreír. “Despreocupada”, piensa otra vez, se pregunta si él podría aprender a existir sin la urgencia de llenar cada espacio con palabras, con explicaciones, con memorias prestadas.</p>

<p>El pasto húmedo huele a tierra recién mojada. Todo sigue, incluso él sentado allí, incluso él intentando encontrar sentido a la espera.</p>

<p>Y al final, mientras su propia voz rompe el silencio con notas que solo él oye, empieza a imaginar que él puede llenar ese vacío con lo que quiera, con lo que necesite y desee. Un vacío que sabe que pronto desaparecerá, un vacío repleto de pequeñas cosas. Un mundo donde puede sentarse, escuchar y existir sin necesidad de nadie más.</p>

<p>Una inmensa nube tapa el sol que lo reconocía y comienza a escupirle en la cara. De todas las cosas que podían pasarle, el nuevo instrumento del agua golpeando el piso no era lo que quería. La lluvia lo hace correr buscando refugio; el silencio se disuelve en los charcos y vuelve a sentir un corazón. No reconoce de quién, pero mientras corra, sabe que estará bien.</p>

<br><br><br><br><br><br>

<p style="text-align: left;"> <em>A mi bella:</em></p>
<p style="text-align: left;"><em>Hoy pensé en ti más que otros días. Creí que podía imaginarte con exactitud, pero me equivoqué. Me faltaron ciertos detalles para suplir tu ausencia; puede que realmente mi esencia me impida recordar todo para seguir necesitando de ti.
Hace poco descubrí que no todas las aves pueden cantar. Solo ciertos pájaros son capaces de convertir sus trinos en melodías.<br>
<strong>Brillo</strong>, cantando por tu corazón.</em></p>


<br><br><br><br><br><br>


<p><strong>Enséñame a Cantar</strong></p>

<p>El arte nunca fue mi fortaleza, el arte nunca fue mi inspiración. El arte era un misterio ajeno, algo que miraba desde fuera con la certeza de no pertenecerle.
Y, sin embargo, aquí estoy: escribiendo, pensando, creando. Y todo porque tú me inspiras. ¿Eso te convierte en arte?</p>

<p>Solo dos veces me había sentido con este nivel de nerviosismo. No es un nerviosismo que nace del miedo, sino de la incertidumbre, de estar al borde de un precipicio y no saber si voy a caer o volar. La primera fue al realizarme mi primer tatuaje; la segunda, al enviarte aquella primera carta. Hoy es la tercera. Y, de algún modo, las tres veces tienen que ver con la permanencia.
La taza de café frente a mí ya está tibia. El murmullo de la cafetería es un zumbido lejano que no logra penetrar mi ansiedad. Estoy sentado, sabiendo cuándo y en qué sentido vienes. Tengo nervios de verte y no saber qué cara poner. Estoy seguro de que se verá hermosa, como siempre. Tan hermosa que tendré que inventar una palabra por encima de hermosa.
El café huele a tierra quemada y a madrugada, pero no siento el sabor en la boca. Mis manos tiemblan un poco, no por la cafeína, sino por la idea de que pronto vas a sonreír frente a mí. La cafetería tiene paredes color crema, cuadros de artistas desconocidos y lámparas que cuelgan demasiado bajo, pero todo eso se borra. Porque cuando llegas, la decoración se convierte en escenografía, un fondo vacío que no me importa.</p>

<p>Y entonces la veo a través del cristal.
Alice con “e”. Alice con rizos. Alice con lunares y rubor. Alice con amor. Alice con collares. Alice conmigo; yo con Alice.</p>

<p>El tiempo se deforma a su alrededor mientras empuja la puerta. No camina: me atrae hacia ella, un centro gravitacional. Me siento anclado y a la deriva en su órbita.
Se sienta frente a mí y sonríe. Es inútil. La cafetería, el ruido, todo se borra. La miro directo a los ojos y lo único que veo es mi reflejo perdido en ese universo oscuro que tiene por mirada. Todo da vueltas y me da vértigo. Veo todo girando, pero estoy seguro de que ella está quieta, inmune al movimiento. Inmune al temor y a los vientos.
—¿Perdón, esperaste mucho? —pregunta, y su voz es lo único que detiene el giro.
Niego con la cabeza, incapaz de formar una frase coherente. Ella empieza a hablar de su día, de una clase, de algo gracioso que le pasó. Y yo la escucho, pero es como escuchar la lluvia en otro planeta.</p>

<p>Ahora contigo no estoy solo, me digo a mí mismo. Ahora contigo me siento iluminado, con una energía que no es mía. En tus brazos me encuentro. Usa mi brazo, apóyate en él. Apóyate en mí. Usa todo lo que tengo para darte.</p>

<p>Mi amor no debe ser como el de los demás. Me estoy conociendo y me has enseñado a conocerme. Y me pregunto: ¿estaré listo para recibir todo tu amor? Lo sé, no amo como los demás. No me sale la espontaneidad torpe de quienes improvisan promesas rápidas. Yo siento más lento, pero más profundo, como los ríos que no corren por la superficie, sino bajo la tierra. Tú has cavado dentro de mí, has abierto grietas en mi corazón y por ellas circula ahora mi manera de amarte.
Aplástame, te doy permiso. Usa mi alma, solo devuélvela limpia. Usa mi vida, disfruta la tuya. Solo déjame ser parte.
Hablas sobre tus pasiones. Tú eres palabra y yo apenas balbuceo. Y, aun así, algo en ti me mira como si yo tuviera un lugar en tu universo. Esa contradicción me sostiene, aunque también me aterra.</p>

<p>El reflejo de la luz en tus collares me devuelve a la mesa. Tu risa bajita me hace sonreír de manera automática. Tenías razón al decirme que te daba un poco de vergüenza sonreír; bajas la cabeza mientras ríes o pones tu mano sobre la boca. No lo entiendo: tienes la sonrisa más única que he visto.</p>

<p>Hasta ahora, lo más difícil fue mandarte esa carta. No te conocía en absoluto: solo habíamos cruzado algunas miradas, compartido equipos de trabajo y una vez me ayudaste con mi corbata. Pero no habíamos conectado en nada, solo coincidido. Y aun así, tomé el riesgo. Lo sentía en la garganta, como un grito detenido. Necesitaba hacerlo. Necesitaba acercarme a ti, sentía la necesidad de que me conocieras.</p>

<p>Eso fue lo más difícil, porque ahora ya no siento dificultad en nada. El inicio siempre me mata, pero al oír tus primeras sílabas el nervio desaparece y retomo el camino. Chistes, anécdotas, burlas, coqueteos. Todo me nace desde lo más profundo, debo decirlo: aunque desconozca si pasaré quinientos años contigo, creo que soy capaz de vivirlos.</p>

<p>Hablas de un viaje que quieres hacer y, al gesticular, tu mano roza la mía sobre la mesa. Un contacto provocado por la estrechez del espacio. Quítala, arrójala, destrúyela. Destruye todo lo que nos impida estar lo más cerca posible.</p>

<p>Es mi turno de hablar. Tanto que decirte y tanto que evitar, pienso. Tal vez te pregunte sobre tus clases de canto... ¿o debería hablarte sobre mí? Aún necesito aprender más.</p>

<p>No sé cantar, y no tengo idea de cómo intentarlo. Enséñame a cantar y escucha lo que tengo que decirte. Son tantas cosas que siento que la escritura no alcanza para contenerlas. Tu voz es la satisfacción sintetizada; es el cuidado y la ayuda en su forma más real.</p>

<p>Eres música, si debo definirte. Eres música y la música es arte. Por lo tanto, si tú eres música, eres arte; y si eres arte, entonces me inspiras. ¿Así nace el arte? Y todo esto mientras aprendo cada palabra que sale de tu boca, buscando significado a todo para lograr entenderlo y salir a gritarlo. Esfuerzo mi memoria para lograr ser algo más.</p>

<p>Siempre dije que no me gustaba mentir. Pero me obligas a vivir en una mentira alegre. Me encantas en la extensión más profunda de la palabra y hacia adentro, hacia el fondo oscuro y especial de ella. Me encantas con tus poderes inexpertos e inconscientes.</p>

<p>¿Qué estás pensando? ¿Pensarás tanto como yo? ¿Notarás lo mucho que quiero tu ayuda? Dios, ayúdame a contenerme. Estrellita, cuídame para salir de este miedo.</p>

<p>Todo está bien, está perfecto, porque puedo hacerte sentir bien y eso me hace feliz. Me haces feliz, te hago feliz y te entrego todo de mi vida. Llévame a lugares en los que nunca he estado: tan alto que las nubes desaparezcan y el sol nos observe solo a nosotros dos. Tan profundo en el mar que mi vida y la tuya se fusionen atómicamente por la presión.</p>

<p>Nuestros átomos fusionados, formando una sola vida, una sola mente y razón. Nuestros destinos enlazados por algo más fuerte que nuestra voluntad. Una voluntad ligada a lo físico, a la gravedad y a la fuerza inacabable. Una masa atrayéndonos y a la que decidimos ceder. Yo quiero estar contigo y tú quieres estar junto a mí.</p>

<p>Había decidido deshumanizarme por temor a lo desconocido, pero por ti aceptaría todo sentimiento conocido, crearía nuevos solo para representar todo lo que me haces sentir. Si aprender a amar significa crear, si amar significa llorar y reír al mismo tiempo, si amar significa voltear a la luna y pensar en ti… entonces sé cómo se siente amar.</p>

<br><br><br><br><br><br>

<p style="text-align: left;"> <em>A la pequeña constelación:</em></p>
<p style="text-align: left;"><em>¿Te han dicho que tus lunares forman una constelación y tu voz es el mar antes de romperse? Me gusto mucho salir de nuevo contigo, quien diría que podríamos conectar tanto desde aquel día.
Estoy construyendo una sorpresa, hecha de notas y de luz. Espero que cuando la escuches, reconozcas en ella un pedazo de ti.<br>
Afinando, <strong>Brillo</strong>.</em></p>


<br><br><br><br><br><br>

<p><strong>Jamás Escuchare un Siempre</strong></p>

<p><p>”Que el sonido era la incesante repetición de las palabras siempre, jamás, siempre, jamás. Siempre, estar en el infierno; jamás estar en el cielo; siempre estar privado de la presencia de Dios; jamás, gozar de su visión beatífica.”
—James Joyce</p>

<p>Joyce dedicó páginas enteras a su terror de la eternidad. Al fuego que no se apaga. A la condena que no termina. A ese infierno donde el “siempre” es una promesa cruel y el “jamás” una puerta cerrada.</p>

<p>Pero tal vez se equivocó al concederles tanto poder. “Siempre” y “jamás” no son destinos, son espejismos que asustan porque parecen infinitos.</p>

<p>Ninguna vida alcanza para entender lo eterno o ningún corazón puede sostener un para siempre. Y sin embargo, nos aferramos a esas palabras como si fueran refugio.</p>

<p>Quizá por eso estoy aquí, pensé. Para aprender a no perseguir horizontes que no se tocan.</p>

<p>Noel estaba sentado a mi lado, en el banco de madera que crujía con cada cambio de peso. El circo ardía delante de nosotros: luces, gritos, llamas danzantes. Nadie nos veía. A nadie le importaba. Era un espectáculo hecho para distraer, pero nosotros no estábamos allí para distraernos.</p>

<p>—¿Por qué miras tanto esa ventana? —preguntó Noel sin mirarme.</p>

<p>—Creí ver una figura —respondí—. Una mujer, tal vez.</p>

<p>Él siguió la dirección de mi mirada: la ventana que reflejaba las llamaradas del escenario. Solo había humo y el eco del movimiento. Nada más.</p>

<p>—A veces me asusta esto —confesó Noel—. No el fuego… sino que todo parezca reflejarse. Como si nada cambiara nunca. Como si me estuviera mirando fijo.</p>

<p>Lo observé. Sus hombros tensos. El temblor leve en su voz.</p>

<p>—¿Te refieres a sentir que hay un castigo esperándote? —pregunté.</p>

<p>Noel asintió.</p>

<p>—Como si fuera a pagar por algo, aunque no sé qué.</p>

<p>—Págame las palomitas—dije—. Eso o un castigo eterno basado en no entender lo suficiente.</p>

<p>Noel soltó una risa amarga.</p>

<p>—¿Tú crees en eso? ¿En el fuego que nunca se apaga?</p>

<p>—No. Creo en otro tipo de fuego —respondí—. El que repite palabras en tu cabeza. El que no necesita llamas para quemarte.</p>

<p>Nos quedamos en silencio. El público aplaudía una última acrobacia. El viento arrastró polvo y un olor dulce a maíz tostado.</p>

<p>—A mí me asusta lo contrario —dijo Noel, más bajo—. Que todo lo que amé ya no exista. Que jamás vuelva.</p>

<p>Sentí cómo su “jamás” se rompía dentro de mis costillas.</p>

<p>—El fuego no solo quema —dije—. También se lleva recuerdos que creías eternos. Y los “jamás” que caen sin avisar.</p>

<p>La ventana ya no tenía ninguna figura. Solo el reflejo de Noel y el mío, distorsionados por el cristal. Pensé en todas las veces que alguien me juró un “siempre”.</p>

<p>En la velocidad con que los “nunca” se incrustaron en mi cuerpo. En cómo la eternidad, para Joyce, era fuego… y para mí, memoria.</p>

<p>Respiré hondo.</p>

<p><p>Se levantó del banco. Cada paso dejaba una huella en el polvo, cada movimiento era un recordatorio de que estaba vivo, aunque todo fuese pasajero. La eternidad no estaba en lo prometido, sino en la percepción de lo que ocurre mientras ocurre. Y en ese instante, comprendió que no necesitaba respuestas ni absolutos. Solo podía existir, respirar y dejar que el mundo le siguiera hablando de siempres que jamás escuchará.</p>
</p>

<p>Las eternidades son para las estrellas y para nosotros los fragmentos.</p>
<p>El sol ya se había escondido. Las antorchas proyectaban sombras largas que parecían olas. La brisa nocturna traía sonidos mezclados, restos de conversaciones, de risas, de algo que parecía música y luego dejaba de serlo.</p>
<p>Cerré los ojos. Sentí pasar el viento a través de mí. No necesitaba entenderlo todo. No necesitaba sostener nada para siempre. Solo existía el ahora con un presente imperfecto, pero vivo.</p>
<p>Abrí los ojos. Me levanté del banco. El polvo se levantaba bajo mis pasos. El circo seguía, pero ya no importaba.</p>
<p>Mientras caminaba, pensé en Joyce, en Noel, en Alice. En todos los siempres que no se cumplieron, en los jamases que llegaron sin pedir permiso.</p>
<p>Y sonreí, apenas.</p>
<p>Porque entendí, al fin, que la eternidad no es una duración. Es una sensación. Un instante tan intenso que parece no acabarse nunca. El resto es humo.</p>
<p>Seguí caminando. El mundo seguía moviéndose, sin promesas, sin amenazas.</p>
<p>Y por primera vez, supe que podía escuchar todas las palabras del mundo… excepto un siempre.</p>
<br><br><br><br><br><br>

<p style="text-align: left;"> <em>Para Alice:</em></p>
<p style="text-align: left;"><em>Al acercarme, siento un desasosiego en mi espíritu que me arrastra hacia un éxtasis extraño. Déjame amarte; no logro dormir pensando en todas las historias y secretos que podrías compartir conmigo. Quiero escucharte, aprender de ti, despertar en tu voz.<br>
Te prometo un “para siempre”, porque lo único eterno seríamos tú y yo.<br>
Con sueño, <strong>Brillo</strong>.</em></p>
`


    }
];

// PARTE 2: Gigante Roja
export const PART_2_CHAPTERS: Chapter[] = [
    {
        number: "3",
        title: "Lejanía",
        content: `<p>La distancia en el espacio se mide en años luz, una unidad tan vasta que desafía la comprensión intuitiva. Un año luz es la distancia que la luz recorre en un año: aproximadamente 9.5 billones de kilómetros. Y las estrellas más cercanas están a varios años luz de distancia.</p>

<p>Esta lejanía no es solo física; es temporal. Cuando miramos una estrella a 100 años luz de distancia, la vemos como era hace un siglo. El presente de esa estrella es inaccesible para nosotros, separado por el límite absoluto de la velocidad de la luz.</p>

<p>La lejanía crea perspectiva. Desde la Luna, la Tierra parece pequeña. Desde Marte, es apenas visible. Desde los confines del sistema solar, es un punto pálido azul, como lo describió Carl Sagan. Y desde otra galaxia, nuestro sistema solar entero sería invisible.</p>

<p>Esta perspectiva es humillante y liberadora al mismo tiempo. Nuestros problemas, que parecen tan importantes, se vuelven insignificantes cuando se ven desde la distancia cósmica. Las guerras, los conflictos, las preocupaciones diarias... todo parece trivial cuando se contempla desde la vastedad del espacio.</p>

<p>Pero la lejanía también nos une. Todos estamos en la misma pequeña roca flotando en el vacío. Las fronteras que dibujamos en los mapas son invisibles desde el espacio. Las diferencias que nos separan palidecen ante la realidad de nuestra existencia compartida.</p>

<p>Los viajeros espaciales hablan de un fenómeno llamado <em>"efecto de perspectiva general"</em> - una transformación cognitiva que ocurre al ver la Tierra desde el espacio. De repente, las divisiones artificiales desaparecen y se ve la humanidad como una sola especie en un solo planeta.</p>

<p>La lejanía nos recuerda que somos visitantes temporales en este cosmos. Nuestro tiempo aquí es breve, un parpadeo en la escala temporal del universo. Pero en ese breve momento, tenemos la oportunidad de maravillarnos, de explorar, de comprender.</p>`
    },
    {
        number: "4",
        title: "Calor",
        content: `<p>Las estrellas son hornos nucleares, fusionando hidrógeno en helio y liberando cantidades inimaginables de energía en el proceso. El calor que generan es tan intenso que la materia existe en un estado que no encontramos naturalmente en la Tierra: plasma.</p>

<p>Nuestro Sol, una estrella de tamaño medio, tiene una temperatura superficial de aproximadamente 5,500 grados Celsius. Pero en su núcleo, donde ocurre la fusión nuclear, la temperatura alcanza los 15 millones de grados. A estas temperaturas, los átomos se mueven tan rápido que se fusionan, liberando la energía que hace posible la vida en la Tierra.</p>

<p>El calor de las estrellas viaja a través del vacío del espacio en forma de radiación electromagnética. La luz que sentimos como calor en nuestra piel ha viajado 150 millones de kilómetros desde el Sol, atravesando el vacío absoluto del espacio en solo 8 minutos.</p>

<p>Pero el calor estelar no es solo físico; es también metafórico. Las estrellas son faros de esperanza en la oscuridad, símbolos de constancia en un universo cambiante. Su luz cálida nos ha guiado durante milenios, tanto literal como figurativamente.</p>

<p>Cada estrella tiene su propio ciclo de vida, determinado en gran parte por su masa. Las estrellas más masivas arden con más intensidad, consumiendo su combustible rápidamente y viviendo vidas cortas pero espectaculares. Las estrellas más pequeñas arden lentamente, viviendo billones de años.</p>

<p>Al final de su vida, las estrellas masivas explotan en supernovas, eventos tan energéticos que por un breve momento pueden brillar más que galaxias enteras. En estas explosiones, se forjan los elementos pesados que componen nuestros cuerpos. <strong>Somos, literalmente, polvo de estrellas.</strong></p>

<p>El calor de las estrellas muertas persiste en forma de nebulosas planetarias y remanentes de supernova, recordatorios brillantes de que incluso en la muerte, las estrellas continúan iluminando el cosmos.</p>`
    }
];

// PARTE 3: Placeholder (agrega tus capítulos aquí)
export const PART_3_CHAPTERS: Chapter[] = [
    {
        number: "5",
        title: "Capítulo 5 - Placeholder",
        content: "<p>Contenido del capítulo 5...</p>"
    }
];

// PARTE 4: Placeholder (agrega tus capítulos aquí)
export const PART_4_CHAPTERS: Chapter[] = [
    {
        number: "6",
        title: "Capítulo 6 - Placeholder",
        content: "<p>Contenido del capítulo 6...</p>"
    }
];

// Exportar todas las partes organizadas
export const ALL_PARTS: Part[] = [
    {
        partNumber: 1,
        partTitle: "Nebulosa",
        chapters: PART_1_CHAPTERS
    },
    {
        partNumber: 2,
        partTitle: "Gigante Roja",
        chapters: PART_2_CHAPTERS
    },
    {
        partNumber: 3,
        partTitle: "Enana Blanca",
        chapters: PART_3_CHAPTERS
    },
    {
        partNumber: 4,
        partTitle: "Agujero Negro",
        chapters: PART_4_CHAPTERS
    }
];

// Helper function para obtener capítulos de una parte
export const getPartChapters = (partNumber: number): Chapter[] => {
    const part = ALL_PARTS.find(p => p.partNumber === partNumber);
    return part ? part.chapters : [];
};
